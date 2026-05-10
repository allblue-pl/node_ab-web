'use strict';

import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const chalk = require('chalk');

// const abFS = require('ab-fs');


export default class DistExt extends Ext {
    #path: string;

    constructor(builder: Builder) { 
        super(builder);

        this.#path = builder.settings.config.dist;
    }


    /* abWeb.Ext Overrides */
    __getName(): string {
        return "dist";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        for (let onChangeInfo of changeInfos.files) {
            let fsPath = onChangeInfo.fsPath;
            let fileRelPath = path.relative(path.join('..', 'dev'), 
                    fsPath);
            let distPath = path.join(this.#path, fileRelPath);

            let distDirPath = path.dirname(distPath);
            if (!fs.existsSync(distDirPath))
                abFS.mkdirRecursiveSync(distDirPath);
            fs.copyFile(fsPath, distPath, () => {
                this.console.log('Copied:', fileRelPath);
            });
        }

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        // if ('path' in config)
        //     this.#path = config.path;

        if (!this.builder.isType('rel'))
            return true;

        if (!('paths' in config))
            return false;

        this.watch('files', [ 'add', 'unlink', 'change' ], config.paths);

        this.build();

        return true;
    }

    // __parse_Pre(config) {
        /* Shouldn't be deleted in case of 2 different builds without overlaping resources. */
        // let distPath = path.join(this.buildInfo.index, 'dist');
        // if (fs.existsSync(distPath))
        //     abFS.removeSync(distPath);
    // }
    /* / abWeb.Ext Overrides */

}
