import path from "node:path";
                                            
import Ext, { ExtPrinter } from "../../Ext.js";
                                                                      
import abFS from "ab-fs";
import fs from "node:fs";

export default class DistExt extends Ext {
    #path        ;

    #print_Copied               ;

    constructor(builder         ) { 
        super(builder);

        this.#path = builder.settings.config.dist;
        this.#print_Copied = [];
    }


    /* abWeb.Ext Overrides */
    __getName()         {
        return "dist";
    }

    __onChange(changeInfos             )          {
        for (let onChangeInfo of changeInfos.files) {
            let fsPath = onChangeInfo.fsPath;
            let fileRelPath = path.relative(path.join('..', 'dev'), 
                    fsPath);
            let distPath = path.join(this.#path, fileRelPath);

            if (onChangeInfo.eventTypes.at(-1) === "unlink") {
                if (fs.existsSync(distPath))
                    fs.unlinkSync(distPath);
                let i = this.#print_Copied.indexOf(fileRelPath);
                if (i !== -1)
                    this.#print_Copied.splice(i, 1);
            } else {
                let distDirPath = path.dirname(distPath);
                if (!fs.existsSync(distDirPath))
                    abFS.mkdirRecursiveSync(distDirPath);
                fs.copyFileSync(fsPath, distPath);
                this.#print_Copied.push(fileRelPath);
            }
        }

        return true;
    }

    __parse(config                 )          {
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

    __printLogs(printer            )       {
        this.#print_Copied.sort();
        for (let print of this.#print_Copied)
            printer.log(`Copied: ${print}`);
    }
    /* / abWeb.Ext Overrides */

}
