'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('../../.');


class abWeb_Replace extends abWeb.Ext
{

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._header = this.uses('header');
        this._header.afterBuild(() => {
            this.build();
        });

        this._files = new Set();
    }

    /* abWeb.Ext Overrides */
    __build(taskName)
    {
        this.console.info('Building...');

        let promises = [];
        for (let file of this._files) {
            promises.push(new Promise((resolve, reject) => {
                fs.readFile(file, (err, content) => {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    content = content.toString();
                    content = content.replace(/{{base}}/g, this.buildInfo.base);
                    content = content.replace(/{{header}}/g, this._header.getHtml());

                    let newFile = path.join(path.dirname(file), 
                            path.basename(file).substring(1));
                    fs.writeFile(newFile, content, (err) => {
                        if (err !== null) {
                            reject(err);
                            return;
                        }

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

    __onChange(fsPaths, changes)
    {
        this._files = new Set(fsPaths.files);
        this._header.build();
    }

    __parse(config)
    {
        if (!('files' in config))
            return;

        this.watch('files', [ 'add', 'unlink', 'change' ], config.files);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Replace;