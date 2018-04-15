'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('../../.');
const chalk = require('chalk');

// const abFS = require('ab-fs');


class abWeb_JS extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._fsPaths = new Set();

        this._header.addTagGroup('js');
    }


    _compareSets(set_a, set_b)
    {
        if (set_a.size !== set_b.size)
            return false;

        for (let item_a of set_a) {
            if (!set_b.has(item_a))
                return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(task_name)
    {
        this.console.info('Building...');

        this._header.clearTags('js');

        this.console.log('Scripts:');
        for (let fs_path of this._fsPaths) {
            let relPath = path.relative(this.buildInfo.index, fs_path)
                    .replace(/\\/g, '/');
            let uri = this.buildInfo.base + relPath + '?v=' +
                    this.buildInfo.hash;

            this._header.addTag('js', 'script', {
                src: uri,
                type: 'text/javascript',
            }, '');

            this.console.log('    - ' + relPath);
        }

        this.console.success('Finished.');
        this._header.build();
    }

    __clean(task_name)
    {
        return null;
    }

    __onChange(fsPaths, eventTypes)
    {
        if (this.buildInfo.type('dev')) {
            if (!this._compareSets(fsPaths.files, this._fsPaths)) {
                this._fsPaths = new Set(fsPaths.files);
                this.build();
            }
        }
    }

    __parse(config)
    {
        // abWeb.types.conf(config, {
        //     'paths':  {
        //         required: false,
        //         type: 'array',
        //     },
        // });

        if ('paths' in config) {
            if (this.buildInfo.type('dev'))
                this.watch('files', [ 'add', 'unlink' ], config.paths);
            else if (this.buildInfo.type('rel'))
                this.watch('files', [ 'add', 'unlink', 'change' ], config.paths);
        }

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JS;
