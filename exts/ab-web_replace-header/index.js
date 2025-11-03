'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('../../.');


class abWeb_Replace extends abWeb.Ext {

    constructor(abWeb, extPath) { super(abWeb, extPath);
        this._header = this.uses('header');
        this._header.afterBuild(() => {
            this.build();
        });

        this._files = new Set();
    }

    /* abWeb.Ext Overrides */
    __build(taskName) {
        this.console.info('Building...');

        let promises = [];
        for (let file of this._files) {
            let newFileName = null;
            for (let filePair of this._files_Config) {
                if (path.resolve(filePair[0]) === file) {
                    newFileName = filePair[1];
                    break;
                }
            }
            if (newFileName === null) {
                this.error('Cannot resolve new file name for: ' + file);
                return;
            }

            promises.push(new Promise((resolve, reject) => {
                fs.readFile(file, (err, content) => {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    content = content.toString();
                    content = content.replace(/{{Base}}/g, this.buildInfo.base);
                    content = content.replace(/{{Header}}/g, this._header.getHtml_Header());
                    content = content.replace(/{{Header_Scripts}}/g, this._header.getHtml_Header_Scripts());
                    content = content.replace(/{{PostBody}}/g, this._header.getHtml_PostBody());
                    content = content.replace(/{{PostBody_Scripts}}/g, this._header.getHtml_PostBody_Scripts());

                    let newFile = path.resolve(newFileName);
                    fs.writeFile(newFile, content, (err) => {
                        if (err !== null) {
                            reject(err);
                            return;
                        }

                        this.console.log('Replaced: ' + file + ' -> ' + newFile);

                        resolve();
                    });
                });
            }));
        }

        return Promise.all(promises)
            .then(() => {
                this.console.success('Finished.');
            });
    }

    __onChange(fsPaths, changes) {
        this._files = new Set(fsPaths.files);
        this._header.build();
    }

    __parse(config) {
        if (!('files' in config))
            return;

        this._files_Config = config.files;

        let files = [];
        for (let file of config.files)
            files.push(file[0]);

        this.watch('files', [ 'add', 'unlink', 'change' ], files);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Replace;