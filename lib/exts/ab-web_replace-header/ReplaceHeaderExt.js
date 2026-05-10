import path from "node:path";
import Ext from "../../Ext.js";
import fs from "node:fs";
class ReplaceExt extends Ext {
    #header;
    #files;
    #config_Files;
    constructor(builder) {
        super(builder);
        this.#header = this.uses('header');
        this.#header.afterBuild(() => {
            this.build();
        });
        this.#files = new Set();
        this.#config_Files = [];
    }
    /* abWeb.Ext Overrides */
    async __build() {
        this.console.info('Building...');
        let promises = [];
        for (let file of this.#files) {
            let newFileName = null;
            for (let filePair of this.#config_Files) {
                if (path.resolve(filePair[0]) === file) {
                    newFileName = filePair[1];
                    break;
                }
            }
            if (newFileName === null) {
                this.console.error('Cannot resolve new file name for: ' + file);
                return false;
            }
            promises.push(new Promise((resolve, reject) => {
                fs.readFile(file, (err, contentBuffer) => {
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    let content = contentBuffer.toString();
                    content = content.replace(/{{Base}}/g, this.builder.settings.config.base);
                    content = content.replace(/{{Header}}/g, this.#header.getHtml_Header());
                    content = content.replace(/{{Header_Scripts}}/g, this.#header.getHtml_Header_Scripts());
                    content = content.replace(/{{PostBody}}/g, this.#header.getHtml_PostBody());
                    content = content.replace(/{{PostBody_Scripts}}/g, this.#header.getHtml_PostBody_Scripts());
                    let newFile = path.resolve(newFileName);
                    fs.writeFile(newFile, content, (err) => {
                        if (err !== null) {
                            reject(err);
                            return;
                        }
                        this.console.log('Replaced: ' + file + ' -> ' + newFile);
                        resolve(true);
                    });
                });
            }));
        }
        return await Promise.all(promises)
            .then(() => {
            this.console.success('Finished.');
            return true;
        });
    }
    __getName() {
        return "replace-header";
    }
    __onChange(changeInfos) {
        this.#files = new Set(this.getWatchedFSPaths().files);
        this.#header.build();
        return true;
    }
    __parse(config) {
        if (!('files' in config))
            return false;
        this.#config_Files = config.files;
        let files = [];
        for (let file of config.files)
            files.push(file[0]);
        this.watch('files', ['add', 'unlink', 'change'], files);
        return true;
    }
}
