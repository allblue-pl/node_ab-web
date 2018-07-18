'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const babel = require('babel-core');
const chalk = require('chalk');

// const abFS = require('ab-fs');


class abWeb_JS extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._scriptsGroups = new abWeb.Groups();
        this.addScriptsGroup('js');

        this._jsPath = path.join(this.buildInfo.front, 'js');
        if (!abFS.existsDirSync(this._jsPath))
            abFS.mkdirRecursiveSync(this._jsPath);

        this._scriptPath = path.join(this.buildInfo.front, 'js', 'script.js');
        this._scriptPath_Min = path.join(this.buildInfo.front, 'js', 'script.min.js');
        this._scriptPath_Map = path.join(this.buildInfo.front, 'js', 'script.min.js.map');
    }

    addScript(groupId, scriptPath)
    {
        groupId = `js.${groupId}`;

        if (!this._scriptsGroups.has(groupId))
            this.addScriptsGroup(groupId);

        this._scriptsGroups.addValue(groupId, scriptPath);
        this.build();
    }

    addScriptsGroup(groupId, props = {})
    {
        groupId = `js.${groupId}`;

        this._header.addTagsGroup(groupId, props);
        this._scriptsGroups.add(groupId, props);
    }

    clearScriptsGroup(groupId)
    {
        groupId = `js.${groupId}`;

        this._scriptsGroups.clear(groupId);
        this.build();
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

        for (let groupId of this._scriptsGroups.getGroupIds())
            this._header.clearTagsGroup(groupId);

        if (this.buildInfo.type('rel')) {
            let js = '';
            let scriptGroups = this._scriptsGroups.getValues();
            for (let [ groupId, scriptPaths ] of scriptGroups) {
                this.console.info('    - ' + groupId);
                for (let fsPath of scriptPaths) {
                    js += `\r\n// File: ${fsPath}\r\n`;
                    js += fs.readFileSync(fsPath) + '\r\n';
                    
                    let relPath = path.relative(this.buildInfo.index, fsPath)
                            .replace(/\\/g, '/');
                    this.console.log('    - ' + relPath);
                }
            }

            let polyfill_MinJS = fs.readFileSync(path.join(
                    path.dirname(require.resolve('babel-polyfill')), 
                    '../dist/polyfill.min.js'));
            js = '\r\n// File: babel-pollyfill\r\n' + polyfill_MinJS + '\r\n' + js;

            // fs.writeFileSync(this._scriptPath, js);

            try {
                let script = babel.transform(js, {
                    presets: [ require.resolve('babel-preset-es2015-script') ],
                    // inputSourceMap: this._scriptPath,
                    // sourceMaps: true,
                    minified: true,
                });
                fs.writeFileSync(this._scriptPath_Min, script.code + 
                        '\r\n\r\n//# sourceMappingURL=script.min.js.map');
                // fs.writeFileSync(this._scriptPath_Map, JSON.stringify(script.map));

                this._header.addTag('js.js', 'script', {
                    src: this.uri(this._scriptPath_Min + '?v=' + this.buildInfo.hash),
                    type: 'text/javascript',
                }, '');

                this.console.success('Finished.');
            } catch (err) {
                this._header.addTag('js.js', 'script', {
                    src: this.uri(this._scriptPath_Min + '?v=' + this.buildInfo.hash),
                    type: 'text/javascript',
                }, '');

                this.console.error(err.stack);
            }
        } else {
            this.console.log('Scripts:');
            let scriptGroups = this._scriptsGroups.getValues();
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
            let currentFSPaths = this._scriptsGroups.getGroup('js.js');
            if (!this._compareSets(fsPaths.files, currentFSPaths)) {
                this.clearScriptsGroup('js');
                for (let scriptPath of fsPaths.files)
                    this.addScript('js', scriptPath);
                this.build();
            }
        } else {
            this.clearScriptsGroup('js');
            for (let scriptPath of fsPaths.files)
                this.addScript('js', scriptPath);
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
