'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const babel = require('@babel/core');
const chalk = require('chalk');
const uglifyJS = require('uglify-js');

// const abFS = require('ab-fs');


class abWeb_JS extends abWeb.Ext {

    constructor(ab_web, ext_path) { super(ab_web, ext_path);
        this._configPath = null;
        this._header = this.uses('header');

        this._scriptsGroups_Include = new abWeb.Groups(this);
        this.addScriptsGroup('js', {}, 'include');

        this._scriptsGroups_Compile = new abWeb.Groups(this);
        this.addScriptsGroup('js', {
            after: [ 'js.include.js' ],
        }, 'compile');

        this._jsPath = path.join(this.buildInfo.front, 'js');
        if (!abFS.existsDirSync(this._jsPath))
            abFS.mkdirRecursiveSync(this._jsPath);
        this._jsPath_Tmp = path.join(this.buildInfo.tmp, 'js');
        if (!abFS.existsDirSync(this._jsPath_Tmp))
            abFS.mkdirRecursiveSync(this._jsPath_Tmp);

        this._scriptPath_Include = path.join(this.buildInfo.front, 'js', 'include.min.js');
        this._scriptPath = path.join(this.buildInfo.tmp, 'js', 'script.js');
        this._scriptPath_Min = path.join(this.buildInfo.front, 'js', 'script.min.js');
        this._scriptPath_Map = path.join(this.buildInfo.front, 'js', 'script.min.js.map');
    }

    addScript(groupId, scriptPath, type = 'compile') {
        groupId = `js.${type}.${groupId}`;
        let scriptsGroups = this.getScriptsGroups(type);

        if (!scriptsGroups.has(groupId))
            this.addScriptsGroup(groupId, {}, type);

        scriptsGroups.addValue(groupId, scriptPath);
        this.build();
    }

    addScript_Compile(groupId, scriptPath) {
        this.addScript(groupId, scriptPath, 'compile');
    }

    addScript_Include(groupId, scriptPath) {
        this.addScript(groupId, scriptPath, 'include');
    }

    addScriptsGroup(groupId, props = {}, type = 'compile') {
        groupId = `js.${type}.${groupId}`;

        this._header.addScriptUrisGroup_PostBody(groupId, props);

        this.getScriptsGroups(type).add(groupId, props);
    }

    clearScriptsGroup(groupId, type = 'compile') {
        groupId = `js.${type}.${groupId}`;

        this.getScriptsGroups(type).clear(groupId);
        this.build();
    }

    getScriptsGroups(type) {
        if (type === 'compile')
            return this._scriptsGroups_Compile;
        else if (type === 'include')
            return this._scriptsGroups_Include;
        
        throw new Error('Unknown script type.');
    }


    _compareSets(setA, setB) {
        if (setA.size !== setB.size)
            return false;

        for (let item_a of setA) {
            if (!setB.includes(item_a))
                return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(task_name) {
        this.console.info('Building...');

        let types = [ 'include', 'compile' ];
        for (let type of types) {
            for (let groupId of this.getScriptsGroups(type).getGroupIds())
                this._header.clearScriptUrisGroup_PostBody(groupId);
        }

        if (this.buildInfo.type('rel')) {
            let js = {
                include: `var ABWeb_Hash = '${this.buildInfo.hash}';\r\n`,
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
            // fs.writeFileSync(this._scriptPath + '.debug', js.include);

            let js_Include_Result = uglifyJS.minify(js.include);
            if (typeof js_Include_Result.error !== 'undefined') {
                // console.log('Test', js_Include_Result);
                this.console.error(js_Include_Result.error);
                js_Include_Result = null;
            }

            try {
                let script = babel.transform(js.compile, {
                    presets: [ [require('@babel/preset-env'), {
                        useBuiltIns: 'entry',
                        corejs: 3,
                    }], ],
                    filename: 'script.js',
                    sourceMaps: true,
                    minified: true,
                });

                let modulePaths_CoreJSBundle = path.dirname(require.resolve('core-js-bundle'));
                // __dirname + '/../../node_modules/core-js-bundle/
                let modulePaths_RegeneratorRuntime = path.dirname(require.resolve('regenerator-runtime'));
                // __dirname + '/../../node_modules/regenerator-runtime

                let js_Include_Code = js_Include_Result === null ? 
                        '' : js_Include_Result.code;
                fs.writeFileSync(this._scriptPath_Include, 
                    js_Include_Code + "\r\n" +
                    fs.readFileSync(modulePaths_CoreJSBundle + '/minified.js') + "\r\n" +
                    fs.readFileSync(modulePaths_RegeneratorRuntime + '/runtime.js') + "\r\n");


                fs.writeFileSync(this._scriptPath, js.compile);
                fs.writeFileSync(this._scriptPath_Min, script.code + "\r\n\r\n" +
                        "//# sourceMappingURL=./script.min.js.map");
                fs.writeFileSync(this._scriptPath_Map, JSON.stringify(script.map));
                // +
                        // '\r\n\r\n//# sourceMappingURL=script.min.js.map');
                // fs.writeFileSync(this._scriptPath_Map, JSON.stringify(script.map));

                if (this._header.hasScriptUrisGroup_PostBody('js.min'))
                    this._header.clearScriptUrisGroup_PostBody('js.min');
                else
                    this._header.addScriptUrisGroup_PostBody('js.min');

                // this._header.addTag_PostBody('js.min', 'script', {
                //     src: this.uri(this._scriptPath_Include),
                //     // type: 'text/javascript',
                // }, '');
                this._header.addScriptUri_PostBody('js.min',
                        this.uri(this._scriptPath_Include));

                // this._header.addTag_PostBody('js.min', 'script', {
                //     src: this.uri(this._scriptPath_Min),
                //     // type: 'text/javascript',
                // }, '');
                this._header.addScriptUri_PostBody('js.min',
                        this.uri(this._scriptPath_Min));

                this._header.build();

                this.console.success('Finished.');
            } catch (err) {
                // this._header.addTag_Body('js.min', 'script', {
                //     src: this.uri(this._scriptPath_Include),
                //     // type: 'text/javascript',
                // }, '');


                // this._header.addTag_Body('js.min', 'script', {
                //     src: this.uri(this._scriptPath_Min),
                //     // type: 'text/javascript',
                // }, '');

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
                        let relPath = null;
                        try {
                            relPath = path.relative(this.buildInfo.index, fsPath)
                                    .replace(/\\/g, '/');
                        } catch (e) {
                            this.console.error(e.toString());
                            continue;
                        }

                        let uri = this.buildInfo.base + relPath + '?v=' +
                                this.buildInfo.hash;

                        // this._header.addTag_PostBody(groupId, 'script', {
                        //     src: uri,
                        //     // type: 'text/javascript',
                        // }, '');
                        this._header.addScriptUri_PostBody(groupId, uri);
            
                        this.console.log('    - ' + relPath);
                    }
                }
            }

            this._header.build();
            this.console.success('Finished.');
        }
    }

    __clean(task_name) {
        return null;
    }

    __onChange(fsPaths, changes) {
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

    __parse(config, configPath) {
        this._configPath = configPath;
        // abWeb.types.conf(config, {
        //     'paths':  {
        //         required: false,
        //         type: 'array',
        //     },
        // });

        if ('include' in config) {
            let fsPaths = [];
            for (let fsPath of config.include)
                fsPaths.push(path.join(configPath, fsPath));

            if (this.buildInfo.type('dev'))
                this.watch('include', [ 'add', 'unlink' ], fsPaths);
            else if (this.buildInfo.type('rel'))
                this.watch('include', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        if ('compile' in config) {
            let fsPaths = [];
            for (let fsPath of config.compile)
                fsPaths.push(path.join(configPath, fsPath));

            if (this.buildInfo.type('dev'))
                this.watch('compile', [ 'add', 'unlink' ], fsPaths);
            else if (this.buildInfo.type('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        if ('paths' in config) {
            let fsPaths = [];
            for (let fsPath of config.paths)
                fsPaths.push(path.join(configPath, fsPath));

            if (this.buildInfo.type('dev'))
                this.watch('compile', [ 'add', 'unlink' ], fsPaths);
            else if (this.buildInfo.type('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JS;
