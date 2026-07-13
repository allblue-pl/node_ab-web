import path from "node:path";
import Ext, { ExtPrinter } from "../../Ext.js";
                                                                      
                                                           
import fs from "node:fs";
                                            

export default class ReplaceHeaderExt extends Ext {
    #header           ;
    #files             ;

    #config_Files               ;

    #print_Logs               ;
    #print_Errors               ;

    constructor(builder         ) { 
        super(builder);
        
        this.#header = this.uses('header')             ;
        this.#header.afterBuild(() => {
            this.build();
        });

        this.#files = new Set();
        this.#config_Files = [];

        this.#print_Logs = [];
        this.#print_Errors = [];
    }

    /* abWeb.Ext Overrides */
    async __build()                   {
        this.#print_Logs = [];
        this.#print_Errors = [];

        let promises                          = [];
        for (let file of this.#files) {
            let newFileName = null;
            for (let filePair of this.#config_Files) {
                if (path.resolve(filePair[0]) === file) {
                    newFileName = filePair[1];
                    break;
                }
            }

            if (newFileName === null) {
                this.#print_Errors.push('Cannot resolve new file name for: ' + file);
                return false;
            }

            promises.push(new Promise((resolve, reject) => {
                fs.readFile(file, (err, contentBuffer) => {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    let content = contentBuffer.toString();
                    content = content.replace(/{{Base}}/g, 
                            this.builder.settings.config.base);
                    content = content.replace(/{{Header}}/g, 
                            this.#header.getHtml_Header());
                    content = content.replace(/{{Header_Scripts}}/g, 
                            this.#header.getHtml_Header_Scripts());
                    content = content.replace(/{{PostBody}}/g, 
                            this.#header.getHtml_PostBody());
                    content = content.replace(/{{PostBody_Scripts}}/g, 
                            this.#header.getHtml_PostBody_Scripts());

                    let newFile = path.resolve(newFileName);
                    fs.writeFile(newFile, content, (err) => {
                        if (err !== null) {
                            reject(err);
                            return;
                        }

                        this.#print_Logs.push('Replaced: ' + file + ' -> ' + newFile);

                        resolve(true);
                    });
                });
            }));
        }

        let values = await Promise.all(promises);
        for (let value of values) {
            if (!value)
                return false;
        }

        return true;
    }

    __getName()         {
        return "replace-header";
    }

    __onChange(changeInfos             )          {
        this.#files = new Set(this.getWatchedFSPaths().files);
        this.#header.build();
        return true;
    }

    __parse(config                 )          {
        if (!('files' in config))
            return false;

        this.#config_Files = config.files                 ;

        let files = [];
        for (let file of config.files)
            files.push(file[0]);

        this.watch('files', [ 'add', 'unlink', 'change' ], files);

        return true;
    }

    __printErrors(printer            )       {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    
    __printLogs(printer            )       {
        for (let log of this.#print_Logs)
            printer.log(log);
    }
    /* / abWeb.Ext Overrides */
}