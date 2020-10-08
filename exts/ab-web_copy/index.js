'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const chalk = require('chalk');

// const abFS = require('ab-fs');


class abWeb_Copy extends abWeb.Ext
{

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._config = null;
    }


    /* abWeb.Ext Overrides */
    __build(taskName)
    {
        if (this._config === null)
            return;
        if (!('paths' in this._config))
            return;

        for (let fsPaths of this._config.paths) {
            let srcRelPath = path.relative('..', fsPaths[0])
            let distRelPath = path.relative('..', fsPaths[1]);

            let distPath = path.join(this.buildInfo.index, fsPaths[1]);

            abFS.copySync(fsPaths[0], distPath);
            this.console.log('Copied:', srcRelPath);
        }
    }

    __onChange(fsPaths, changes)
    {
        this.build();
    }

    __parse(config)
    {
        this._config = config;

        if (!this.buildInfo.type('rel'))
            return;

        if (!('paths' in config))
            return;

        let watchPaths = [];
        for (let fsPaths of config.paths) {
            let distPath = path.join(this.buildInfo.index, fsPaths[1]);
            watchPaths.push(fsPaths[0]);
        }
        this.watch('files', [ 'add', 'unlink', 'change' ], watchPaths);
    }

    __parse_Pre(config)
    {
        this._config = config;

        if (!this.buildInfo.type('rel'))
            return;

        if (!('paths' in config))
            return;

        let watchPaths = [];
        for (let fsPaths of config.paths) {
            let distPath = path.join(this.buildInfo.index, fsPaths[1]);
            if (fs.existsSync(distPath))
                abFS.removeSync(distPath);
        }
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Copy;
