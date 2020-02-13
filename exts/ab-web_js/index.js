'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const babel = require('@babel/core');
const chalk = require('chalk');
const uglifyJS = require('uglify-js');

// const abFS = require('ab-fs');


class abWeb_JS extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._scriptsGroups_Include = new abWeb.Groups();
        this.addScriptsGroup('js', {}, 'include');

        this._scriptsGroups_Compile = new abWeb.Groups();
        this.addScriptsGroup('js', {
            after: [ 'js.include.js' ],
        }, 'compile');

        this._jsPath = path.join(this.buildInfo.front, 'js');
        if (!abFS.existsDirSync(this._jsPath))
            abFS.mkdirRecursiveSync(this._jsPath);

        this._scriptPath = path.join(this.buildInfo.front, 'js', 'script.js');
        this._scriptPath_Min = path.join(this.buildInfo.front, 'js', 'script.min.js');
        this._scriptPath_Map = path.join(this.buildInfo.front, 'js', 'script.min.js.map');
    }

    addScript(groupId, scriptPath, type = 'compile')
    {
        groupId = `js.${type}.${groupId}`;
        let scriptsGroups = this.getScriptsGroups(type);

        if (!scriptsGroups.has(groupId))
            this.addScriptsGroup(groupId, {}, type);

        scriptsGroups.addValue(groupId, scriptPath);
        this.build();
    }

    addScript_Compile(groupId, scriptPath)
    {
        this.addScript(groupId, scriptPath, 'compile');
    }

    addScript_Include(groupId, scriptPath)
    {
        this.addScript(groupId, scriptPath, 'include');
    }

    addScriptsGroup(groupId, props = {}, type = 'compile')
    {
        groupId = `js.${type}.${groupId}`;

        this._header.addTagsGroup(groupId, props);

        this.getScriptsGroups(type).add(groupId, props);
    }

    clearScriptsGroup(groupId, type = 'compile')
    {
        groupId = `js.${type}.${groupId}`;

        this.getScriptsGroups(type).clear(groupId);
        this.build();
    }

    getScriptsGroups(type)
    {
        if (type === 'compile')
            return this._scriptsGroups_Compile;
        else if (type === 'include')
            return this._scriptsGroups_Include;
        
        throw new Error('Unknown script type.');
    }


    _compareSets(setA, setB)
    {
        if (setA.size !== setB.size)
            return false;

        for (let item_a of setA) {
            if (!setB.includes(item_a))
                return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(task_name)
    {
        this.console.info('Building...');

        let types = [ 'include', 'compile' ];
        for (let type of types) {
            for (let groupId of this.getScriptsGroups(type).getGroupIds())
                this._header.clearTagsGroup(groupId);
        }

        if (this.buildInfo.type('rel')) {
            let js = {
                include: '',
                compile: '',
            };
            for (let type of types) {
                this.console.log(`Type (${type}):`);

                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    this.console.info('    - ' + groupId);
                    for (let fsPath of scriptPaths) {
                        js[type] += `\r\n// File: ${fsPath}\r\n`;
                        js[type] += fs.readFileSync(fsPath) + '\r\n';
                        
                        let relPath = path.relative(this.buildInfo.index, fsPath)
                                .replace(/\\/g, '/');
                        this.console.log('    - ' + relPath);
                    }
                }
            }
            
            /* script.js */
            // fs.writeFileSync(this._scriptPath, 
            //         '/* Include: */\r\n\r\n' + js.include + 
            //         '\r\n\r\nCompile:\r\n\r\n' + js.compile);

            let js_Include_Result = uglifyJS.minify(js.include);
            if (typeof js_Include_Result.error !== 'undefined')
                this.console.error(js_Include_Result.error);

            try {
                let script = babel.transform(js.compile, {
                    presets: [ require('@babel/preset-env') ],
                    // inputSourceMap: this._scriptPath,
                    // sourceMaps: true,
                    minified: true,
                });
                fs.writeFileSync(this._scriptPath_Min, js_Include_Result.code + 
                        '\r\n' + script.code) 
                // +
                        // '\r\n\r\n//# sourceMappingURL=script.min.js.map');
                // fs.writeFileSync(this._scriptPath_Map, JSON.stringify(script.map));

                if (this._header.hasTagsGroup('js.min'))
                    this._header.clearTagsGroup('js.min');
                else
                    this._header.addTagsGroup('js.min');

                this._header.addTag('js.min', 'script', {
                    src: this.uri(this._scriptPath_Min + '?v=' + this.buildInfo.hash),
                    type: 'text/javascript',
                }, '');

                this._header.build();

                this.console.success('Finished.');
            } catch (err) {
                this._header.addTag('js.min', 'script', {
                    src: this.uri(this._scriptPath_Min + '?v=' + this.buildInfo.hash),
                    type: 'text/javascript',
                }, '');

                this.console.error(err.stack);
            }
        } else {
            this.console.log('Scripts:');
            for (let type of types) {
                this.console.log(`Type (${type}):`)

                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    this.console.info('    - ' + groupId);
                    for (let fsPath of scriptPaths) {
                        let relPath = path.relative(this.buildInfo.index, fsPath)
                                .replace(/\\/g, '/');
                        let uri = this.buildInfo.base + relPath + '?v=' +
                                this.buildInfo.hash;

                        this._header.addTag(groupId, 'script', {
                            src: uri,
                            type: 'text/javascript',
                        }, '');
            
                        this.console.log('    - ' + relPath);
                    }
                }
            }

            this._header.build();
            this.console.success('Finished.');
        }
    }

    __clean(task_name)
    {
        return null;
    }

    __onChange(fsPaths, changes)
    {
        if (this.buildInfo.type('dev')) {
            let types = [ 'include', 'compile' ];
            let build = false;
            for (let type of types) {
                let currentFSPaths = this.getScriptsGroups(type).getGroup(`js.${type}.js`);
                if (!this._compareSets(fsPaths[type], currentFSPaths)) {
                    this.clearScriptsGroup('js', type);
                    for (let scriptPath of fsPaths[type])
                        this.addScript('js', scriptPath, type);
                    build = true;
                }
            }

            if (build)
                this.build();
        } else {
            let types = [ 'include', 'compile' ];
            for (let type of types) {
                this.clearScriptsGroup('js', type);
                for (let scriptPath of fsPaths[type])
                    this.addScript('js', scriptPath, type);
            }

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

        if ('include' in config) {
            if (this.buildInfo.type('dev'))
                this.watch('include', [ 'add', 'unlink' ], config.include);
            else if (this.buildInfo.type('rel'))
                this.watch('include', [ 'add', 'unlink', 'change' ], config.include);
        }

        if ('compile' in config) {
            if (this.buildInfo.type('dev'))
                this.watch('compile', [ 'add', 'unlink' ], config.compile);
            else if (this.buildInfo.type('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], config.compile);
        }

        if ('paths' in config) {
            if (this.buildInfo.type('dev'))
                this.watch('compile', [ 'add', 'unlink' ], config.paths);
            else if (this.buildInfo.type('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], config.paths);
        }

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JS;
