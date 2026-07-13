import abFS from "ab-fs";
import fs from "node:fs";
import path from "node:path";
                                            
import Ext, { ExtPrinter } from "../../Ext.js";
                                                                      

export default class CopyExt extends Ext {
    #config                          ;

    #print_Copied               ;

    constructor(builder         ) {
        super(builder);
        this.#config = null;
        this.#print_Copied = [];
    }


    /* abWeb.Ext Overrides */
    __build()          {
        this.#print_Copied = [];
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
            this.#print_Copied.push('Copied: ' + srcRelPath + " -> " + distRelPath);
        }

        return true;
    }

    __getName()         {
        return "copy";
    }

    __onChange(changeInfos             )          {
        this.build();
        return true;
    }

    __parse(config                 )          {
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

    __parse_Pre(config                 )          {
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

    __printLogs(printer            )       {
        for (let print of this.#print_Copied)
            printer.log(print);
    }
    /* / abWeb.Ext Overrides */

}
