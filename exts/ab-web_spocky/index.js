'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    abWeb = require('../..'),
    js0 = require('js0'),

    LayoutBuilder = require('./LayoutBuilder')
;

class abWeb_Spocky extends abWeb.Ext
{

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._header = this.uses('header');

        this._modulePath = null;

        this._layoutPaths = [];
        this._layoutPaths_ToBuild = new js0.List();
        this._modulePaths = [];

        this._header.addTagGroup('spocky', {
            
        });
    }


    /* abWeb.Ext Overrides */
    __build(taskName)
    {
        this.console.info('Building...');   

        let layoutPaths = [];
        for (let [ i, layoutPath ] of this._layoutPaths_ToBuild) {
            if (!layoutPaths.includes(layoutPath))
                layoutPaths.push(layoutPath);
        }

        let buildLayoutPromises = [];    
        for (let layoutPath of layoutPaths) {
            this._layoutPaths_ToBuild.remove(layoutPath);

            buildLayoutPromises.push((async () => {
                try {
                    LayoutBuilder.Build(layoutPath);
                } catch (err) {
                    this.console.error(`Cannot parse '${layoutPath}':`);
                    this.console.warn(err);
                    return;
                }

                let relLayoutPath = path.relative(this.buildInfo.index, layoutPath)
                        .replace(/\\/g, '/');
                this.console.log('Built: ', relLayoutPath);
            })());
        }

        return Promise.all(buildLayoutPromises)
            .then(() => {
                this._header.clearTags('spocky');

                this._header.addTag('spocky', 'script', {
                    src: this.uri(path.join(this._modulePath, 'js/spocky.js')),
                    type: 'text/javascript',
                }, '');

                for (let layoutPath of this._layoutPaths) {
                    let builtLayoutPath = path.join(path.dirname(layoutPath), 
                            path.basename(layoutPath, '.html') + '.js');

                    this._header.addTag('spocky', 'script', {
                        src: this.uri(builtLayoutPath),
                        type: 'text/javascript',
                    }, '');
                }

                for (let modulePath of this._modulePaths) {
                    this._header.addTag('spocky', 'script', {
                        src: this.uri(modulePath),
                        type: 'text/javascript',
                    }, '');
                }
            })
            .then(() => {
                this.console.success('Finished.');
            });
    }

    __onChange(fsPaths, changes)
    {
        this._layoutPaths = fsPaths.layouts;
        if ('layouts' in changes)
            this._layoutPaths_ToBuild.addAll(changes.layouts);

        this._modulePaths = fsPaths.modules;
        // if ('layouts' in changes) {
        //     for (let i = 0; i < )
        // }

        this.build();
    }

    __parse(config)
    {
        if (!('packages' in config))
            return;

        if (!('path' in config)) {
            this.console.error('Spockies module path not set.');
            return;
        }

        this._modulePath = config.path;

        let layoutPaths = [];
        let modulePaths = [];
        for (let fsPath of config.packages) {
            layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            modulePaths.push(path.join(fsPath, '*.js'));
        }

        this.watch('layouts', [ 'add', 'unlink', 'change' ], layoutPaths);
        this.watch('modules', [ 'add', 'unlink', 'change' ], modulePaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Spocky;