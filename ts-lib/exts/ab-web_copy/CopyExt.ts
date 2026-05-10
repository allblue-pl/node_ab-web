import abFS from "ab-fs";
import fs from "node:fs";
import path from "node:path";
import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class CopyExt extends Ext {
    #config: {[key:string]: any}|null;

    constructor(builder: Builder) {
        super(builder);
        this.#config = null;
    }


    /* abWeb.Ext Overrides */
    __build() {
        if (this.#config === null)
            return false;
        if (!('paths' in this.#config))
            return false;

        for (let fsPaths of this.#config.paths) {
            let srcRelPath = path.relative('..', fsPaths[0])
            let distRelPath = path.relative('..', fsPaths[1]);

            let distPath = path.join(this.builder.settings.config.index, 
                    fsPaths[1]);

            abFS.copySync(fsPaths[0], distPath);
            this.console.log('Copied:', srcRelPath, distRelPath);
        }

        return true;
    }

    __getName(): string {
        return "copy";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        this.build();
        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        this.#config = config;

        if (!this.builder.isType('rel'))
            return false;

        if (!('paths' in config))
            return false;

        let watchPaths = [];
        for (let fsPaths of config.paths) {
            let distPath = path.join(this.builder.settings.config.index, 
                    fsPaths[1]);
            watchPaths.push(fsPaths[0]);
        }
        this.watch('files', [ 'add', 'unlink', 'change' ], watchPaths);

        return true;
    }

    __parse_Pre(config: ExtConfigPreset): boolean {
        this.#config = config;

        if (!this.builder.isType('rel'))
            return false;

        if (!('paths' in config))
            return false;

        let watchPaths = [];
        for (let fsPaths of config.paths) {
            let distPath = path.join(this.builder.settings.config.index, fsPaths[1]);
            if (fs.existsSync(distPath))
                abFS.removeSync(distPath);
        }
        
        return true;
    }
    /* / abWeb.Ext Overrides */

}
