'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const chalk = require('chalk');
const uglifyJS = require('uglify-js');

// const abFS = require('ab-fs');


class abWeb_JS extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._fsPaths = new Set();

        this._header.addTagGroup('js');

        this._jsPath = path.join(this.buildInfo.front, 'js');
        if (!abFS.existsDirSync(this._jsPath))
            abFS.mkdirRecursiveSync(this._jsPath);

        this._scriptPath = path.join(this.buildInfo.front, 'js', 'script.js');
        this._scriptPath_Min = path.join(this.buildInfo.front, 'js', 'script.min.js');
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

        if (this.buildInfo.type('rel')) {
            let js = '';
            for (let fsPath of this._fsPaths)
                js += fs.readFileSync(fsPath);
            fs.writeFileSync(this._scriptPath, js);

            try {
                let script = uglifyJS.minify([ this._scriptPath ], {
                    compress: {
                        dead_code: true,
                        global_defs: {
                            DEBUG: false
                        }
                    }
                });
    
                if ('error' in script)
                    throw script.error;
                else
                    fs.writeFileSync(this._scriptPath_Min, script.code);
                
                fs.unlinkSync(this._scriptPath);

                this._header.addTag('js', 'script', {
                    src: this.uri(this._scriptPath_Min + '?v=' + this.buildInfo.hash),
                    type: 'text/javascript',
                }, '');

                this.console.success('Finished.');
            } catch (err) {
                this.console.error(err);
            }
        } else {
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

            this._header.build();
            this.console.success('Finished.');
        }
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
        } else {
            this._fsPaths = new Set(fsPaths.files);
            this.build();
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
