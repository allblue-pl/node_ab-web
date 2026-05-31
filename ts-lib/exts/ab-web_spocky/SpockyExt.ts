import { List } from "@allblue/ts0";
import Ext from "../../Ext.ts";
import HeaderExt from "../ab-web_header/HeaderExt.ts";
import JSLibsExt from "../ab-web_js-libs/JSLibsExt.ts";
import type Builder from "../../Builder.ts";
import path from "node:path";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
import abFS from "ab-fs";
import fs from "node:fs";
import LayoutBuilder from "./LayoutBuilder.ts";

export default class SpockyExt extends Ext {
    #header: HeaderExt;
    #jsLibs: JSLibsExt;

    #modulePath = null;

    #layoutPaths: Array<string>;
    #layoutOverrides: {[layoutPath:string]: string};
    #layoutPaths_Watched: Array<string>;
    #layoutPaths_ToBuild: Array<string>;
    #indexLayoutPaths: Array<string>;
    #packages: {[packageName:string]: {"fsPath": string}};

    constructor(builder: Builder) { 
        super(builder);

        this.#header = this.uses('header') as HeaderExt;
        this.#jsLibs = this.uses('js-libs') as JSLibsExt;

        this.#modulePath = null;

        this.#layoutPaths = [];
        this.#layoutOverrides = {};
        this.#layoutPaths_Watched = [];
        this.#layoutPaths_ToBuild = [];
        this.#indexLayoutPaths = [];
        this.#packages = {};

        this.#header.addTagsGroup_PostBody('spocky');
    }


    #buildIndex() {
        let changed = false;
        
        if (this.#layoutPaths.length !== this.#indexLayoutPaths.length)
            changed = true;
        
        if (!changed) {
            for (let layoutPath of this.#layoutPaths) {
                if (!this.#indexLayoutPaths.includes(layoutPath)) {
                    changed = true;
                    break;
                }
            }
        }

        if (!changed) {
            for (let indexLayoutPath of this.#indexLayoutPaths) {
                if (!this.#layoutPaths.includes(indexLayoutPath)) {
                    changed = true
                    break;
                }
            }
        }

        if (!changed)
            return;

        this.#indexLayoutPaths = this.#layoutPaths.slice(0);

        let indexPaths: {[layoutDirPath:string]: Array<string>} = {};
        for (let layoutPath of this.#indexLayoutPaths) {
            let packageName = path.basename(path.join(layoutPath, '../..'));   
            let packagePath = path.resolve(this.#packages[packageName].fsPath);
            let layoutDirPath = path.join(packagePath, 'js-lib/$layouts');
            
            if (!(layoutDirPath in indexPaths))
                indexPaths[layoutDirPath] = [];
            indexPaths[layoutDirPath].push(layoutPath);
        }
        this.#indexLayoutPaths = this.#layoutPaths.slice(0);

        for (let indexDirPath in indexPaths) {
            let content = 
`'use strict';

`
            
            for (let layoutPath of indexPaths[indexDirPath]) {
                let layoutName = path.basename(layoutPath, '.html');
            
                content +=
`export const ${layoutName} = require('./${layoutName}');
`
                ;
            }
    
            fs.writeFileSync(path.join(indexDirPath, 'index.js'), content);

            let indexRelPath = path.relative(this.builder.settings.config.index, 
                    path.join(indexDirPath, 'index.js')).replace('/\\/g', '/');
            this.console.log(`Created: ${indexRelPath}`);
        }

    }


    /* abWeb.Ext Overrides */
    async __build(): Promise<boolean> {
        this.console.info('Building...');   
        let layoutPaths: Array<string> = [];
        for (let layoutPath of this.#layoutPaths_ToBuild) {
            if (!layoutPaths.includes(layoutPath))
                layoutPaths.push(layoutPath);
        }

        let buildPromises: Array<Promise<boolean>> = [];    
        for (let layoutPath of layoutPaths) {
            for (let i = this.#layoutPaths_ToBuild.length; i >= 0; i--) {
                if (this.#layoutPaths_ToBuild[i] === layoutPath)
                    this.#layoutPaths_ToBuild.splice(i, 1);
            }

            let packageName = path.basename(path.join(layoutPath, '../..'));
            let packagePath = this.#packages[packageName].fsPath;


            buildPromises.push((async (): Promise<boolean> => {
                try {
                    LayoutBuilder.Build(this, layoutPath, packagePath);
                } catch (err) {
                    this.console.error(`Cannot parse '${layoutPath}':`);
                    this.console.warn((err as Error).stack as string);
                    return false;
                }

                let relLayoutPath = path.relative(this.builder.settings.config.index, 
                        layoutPath).replace(/\\/g, '/');

                return true;
            })());
        }

        buildPromises.push((async (): Promise<boolean> => {
            this.#buildIndex();
            return true;
        })());

        let values = await Promise.all(buildPromises);
        for (let value of values) {
            if (!value)
                return false;
        }

        this.#header.clearTagsGroup_PostBody('spocky');

        this.console.success('Finished.');

        return true;
    }

    __getName(): string {
        return "spocky";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        this.#layoutPaths = this.getWatchedFSPaths().layouts;

        if ('layouts' in changeInfos) {
            for (let changeInfo of changeInfos.layouts) {
                if (changeInfo.eventTypes[changeInfo.eventTypes.length - 1] === 
                        "unlink")
                    continue;

                this.#layoutPaths_ToBuild.push(changeInfo.fsPath);
            }
        }

        if ('packages' in changeInfos) {
            for (let changeInfo of changeInfos.packages) {
                if (changeInfo.eventTypes[changeInfo.eventTypes.length - 1] === "unlink")
                    continue;

                let packageName = path.basename(changeInfo.fsPath);                
                let layoutPath = packageName in this.#layoutOverrides ?
                        path.resolve(path.join(this.#layoutOverrides[packageName], 'layouts/*.html')) :
                        path.join(changeInfo.fsPath, 'layouts/*.html');

                if (!this.#layoutPaths_Watched.includes(layoutPath)) {
                    this.#layoutPaths_Watched.push(layoutPath);
                    this.watch('layouts', [ 'add', 'unlink', 'change' ], this.#layoutPaths_Watched);
                }

                this.#packages[packageName] = {
                    fsPath: changeInfo.fsPath
                };
                this.#jsLibs.addLib(packageName, path.join(changeInfo.fsPath, 'js-lib'));
            }
        }
        
        // if ('layouts' in changes) {
        //     for (let i = 0; i < )
        // }

        this.build();

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        if (!('packages' in config))
            return false;

        if (!('path' in config)) {
            this.console.error('Spockies module path not set.');
            return false;
        }

        if ('layoutOverrides' in config)
            this.#layoutOverrides = config.layoutOverrides;

        this.#modulePath = config.path;
        this.#layoutPaths_Watched = [];
        this.#packages = {};

        let packagePaths = [];
        for (let fsPath of config.packages) {
            // layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            packagePaths.push(fsPath);
        }

        this.watch('layouts', [ 'add', 'unlink', 'change' ], this.#layoutPaths_Watched);
        this.watch('packages', [ 'add' ], packagePaths);

        return true;
    }

    __parse_Pre(config: ExtConfigPreset): boolean {
        if (!('packages' in config))
            return false;

        if (!('path' in config)) {
            this.console.error('Spockies module path not set.');
            return false;
        }

        for (let fsPath of config.packages) {
            let layoutsPath = path.join(fsPath, 'js-lib', '$layouts');
            if (fs.existsSync(layoutsPath)) {
                abFS.removeSync(layoutsPath);
                fs.mkdirSync(layoutsPath);
            }
        }

        return true;
    }
    /* / abWeb.Ext Overrides */
}