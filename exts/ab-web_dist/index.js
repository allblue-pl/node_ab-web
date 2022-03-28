'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const chalk = require('chalk');

// const abFS = require('ab-fs');


class abWeb_Dist extends abWeb.Ext
{

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._path = this.buildInfo.dist;
    }


    /* abWeb.Ext Overrides */
    __build(taskName)
    {
        
    }

    __onChange(fsPaths, changes)
    {
        for (let fsPath of fsPaths.files) {
            let fileRelPath = path.relative(path.join('..', 'dev'), 
                    fsPath);
            let distPath = path.join(this.buildInfo.dist, fileRelPath);

            let distDirPath = path.dirname(distPath);
            if (!fs.existsSync(distDirPath))
                abFS.mkdirRecursiveSync(distDirPath);
            fs.copyFile(fsPath, distPath, () => {
                this.console.log('Copied:', fileRelPath);
            });
        }
    }

    __parse(config)
    {
        // if ('path' in config)
        //     this._path = config.path;

        if (!this.buildInfo.type('rel'))
            return;

        if (!('paths' in config))
            return;

        this.watch('files', [ 'add', 'unlink', 'change' ], config.paths);

        this.build();
    }

    __parse_Pre(config)
    {
        /* Shouldn't be deleted in case of 2 different builds without overlaping resources. */
        // let distPath = path.join(this.buildInfo.index, 'dist');
        // if (fs.existsSync(distPath))
        //     abFS.removeSync(distPath);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Dist;
