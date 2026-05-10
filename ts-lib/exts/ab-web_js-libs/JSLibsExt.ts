import path from "node:path";
import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type JSExt from "../ab-web_js/JSExt.ts";
import fs from "node:fs";
import { WebBuilder } from "js-libs";
import babel from "@babel/core";
import type { ScriptInfo } from "./ts-types.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class JSLibsExt extends Ext {
    #js: JSExt;

    #buildPath: string|null;

    #libPaths: Map<string, string>;
    #scriptsToBuild: Array<ScriptInfo>;

    constructor(builder: Builder) { 
        super(builder);
        
        this.#js = this.uses('js') as JSExt;

        this.#buildPath = null;

        this.#libPaths = new Map();
        this.#scriptsToBuild = [];

        this.#js.addScriptsGroup('js-libs', {
            before: [ 'js.compile.js' ],
            values: [],
        });
    }

    addLib(libName: string, libPath: string) {
        if (!fs.existsSync(libPath)) {
            this.console.error(`Libs '${libName}' path does not exist: '${libPath}'.`);
            return;
        }

        this.#libPaths.set(libName, libPath);
        this.#js.addScriptsGroup(`js-libs.${libName}`, {
            after: [ 'js.compile.js-libs' ],
            values: [],
        });

        this.watch(libName, [ 'add', 'unlink', 'change' ], 
                [ path.join(libPath, '**/*.js') ]);
    }


    async #createScript_Async(scriptInfo: ScriptInfo): Promise<boolean> {
        let libPath = this.#libPaths.get(scriptInfo.libName);
        if (libPath === undefined)
            throw new Error(`Lib '${libPath}' does not exist.`);

        if (this.#buildPath === null)
            throw new Error("Build path not set.");

        let wb = new WebBuilder(scriptInfo.libName, libPath, path.join(
                this.#buildPath, scriptInfo.libName));
        wb.addParser((code, fileFSPath, buildFSPath) => {
            if (this.builder.isType('rel'))
                return code;

            let filename = path.relative(path.dirname(buildFSPath), 
                    fileFSPath).replace(/\\/g, '/');
                    
            let script = null;

            try {
                script = babel.transform(code, {
                    presets: [ [require('@babel/preset-env'), {
                        useBuiltIns: 'entry',
                        corejs: 3,
                    }], ],
                    filename: filename,
                    sourceFileName: filename,
                    sourceMaps: true,
                    minified: false,
                });
            } catch (e) {
                this.console.error(`Cannot compile '${fileFSPath}': ` + (e as Error).stack);
                script = {
                    code: `throw new Error('Cannot compile \\\'${fileFSPath.replace(/\\/g, '\\\\')}\\\'.');`,
                    map: '',
                };
            }
            fs.writeFileSync(`${buildFSPath}.map`, JSON.stringify(script.map));

            return script.code + '\r\n//# sourceMappingURL=' + 
                    path.basename(buildFSPath) + '.map'
        });

        try {
            let builtFSPath = await wb.buildScript_Async(scriptInfo.scriptPath, 
                    false);

            if (scriptInfo.eventType !== 'change')
                this.#js.addScript(`js-libs.${scriptInfo.libName}`, builtFSPath);

            let relScriptPath = path.relative(this.builder.settings.config.index, 
                    scriptInfo.scriptPath).replace(/\\/g, '/');

            this.console.log(`Built: '${scriptInfo.libName}:${relScriptPath}'.`);
        } catch (err) {
            this.console.error(`Error when building '${scriptInfo.libName}:` +
                    `${scriptInfo.scriptPath}'.`,
                    (err as Error).stack as string);
            return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(): Promise<boolean> {
        this.console.info('Building...');

        let buildPromises: Array<Promise<boolean>> = [];
        let buildJS: boolean = false;
        for (let scriptInfo of this.#scriptsToBuild) {
            if (scriptInfo.eventType !== 'change')
                buildJS = true;

            buildPromises.push(this.#createScript_Async(scriptInfo));
        }
        this.#scriptsToBuild = [];

        return Promise.all(buildPromises)
            .then((values) => {
                for (let value of values) {
                    if (!value)
                        return false;
                }

                if (!this.builder.isType('rel') && buildJS)
                    this.#js.build();

                return true;
            });
    }

    __getName(): string {
        return "js-libs";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        for (let libName in changeInfos) {
            for (let changeInfo of changeInfos[libName]) {
                let scriptToBuildFound = false;
                for (let scriptInfo of this.#scriptsToBuild) {
                    if (changeInfo.fsPath === scriptInfo.scriptPath) {
                        scriptToBuildFound = true;
                        break;
                    }
                }

                if (!scriptToBuildFound) {
                    this.#scriptsToBuild.push({
                        libName: libName,
                        scriptPath: changeInfo.fsPath,
                        eventType: changeInfo.eventType,
                    });
                }
            }
        }

        this.build();

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        if (!('path' in config)) {
            this.console.warn(`'path' not set in config.`);
            return false;
        }

        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        this.#buildPath = path.join(buildConfig.tmp, config.build.dev);

        let scriptPath = path.join(buildSettings.initDir, config.path);

        if (!fs.existsSync(scriptPath)) {
            this.console.error(`'path' in config does not exist: '${config.path}'.`);
            return false;
        }

        if (!('libs' in config))
            return false;

        // let libs = config.libs;
        for (let libName in config.libs) {
            this.addLib(libName, path.join(buildSettings.initDir, 
                    config.libs[libName]));
        }

        this.#js.clearScriptsGroup('js-libs');
        // console.log('Test', this.scriptPath);
        this.#js.addScript('js-libs', scriptPath);

        this.build();

        return true;
    }
    /* / abWeb.Ext Overrides */

}
