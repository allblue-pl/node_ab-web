'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    abFS = require('ab-fs'),

    abWeb = require('../..'),
    js0 = require('js0'),

    LayoutBuilder = require('./LayoutBuilder')
;

class abWeb_Spocky extends abWeb.Ext {

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._header = this.uses('header');
        this._jsLibs = this.uses('js-libs');

        this._modulePath = null;

        this._layoutPaths = [];
        this._layoutOverrides = {};
        this._layoutPaths_Watched = [];
        this._layoutPaths_ToBuild = new js0.List();
        this._indexLayoutPaths = [];
        this._packagePaths = [];
        this._packages = {};

        this._header.addTagsGroup_PostBody('spocky', {
            
        });
    }


    _buildIndex()
    {
        let changed = false;
        
        if (this._layoutPaths.length !== this._indexLayoutPaths.length)
            changed = true;
        
        if (!changed) {
            for (let layoutPath of this._layoutPaths) {
                if (!this._indexLayoutPaths.includes(layoutPath)) {
                    changed = true;
                    break;
                }
            }
        }

        if (!changed) {
            for (let indexLayoutPath of this._indexLayoutPaths) {
                if (!this._layoutPaths.includes(indexLayoutPath)) {
                    changed = true
                    break;
                }
            }
        }

        if (!changed)
            return;

        this._indexLayoutPaths = this._layoutPaths.slice(0);

        let indexPaths = {};
        for (let layoutPath of this._indexLayoutPaths) {
            let packageName = path.basename(path.join(layoutPath, '../..'));   
            let packagePath = path.resolve(this._packages[packageName].fsPath);
            let layoutDirPath = path.join(packagePath, 'js-lib/$layouts');
            
            if (!(layoutDirPath in indexPaths))
                indexPaths[layoutDirPath] = [];
            indexPaths[layoutDirPath].push(layoutPath);
        }
        this._indexLayoutPaths = this._layoutPaths.slice(0);

        for (let indexDirPath in indexPaths) {
            let content = 
`'use strict';

`
            
            for (let layoutPath of indexPaths[indexDirPath]) {
                let layoutName = path.basename(layoutPath, '.html');
            
                content +=
`export const ${layoutName} = require('./${layoutName}');
`
                ;
            }
    
            fs.writeFileSync(path.join(indexDirPath, 'index.js'), content);

            let indexRelPath = path.relative(this.buildInfo.index, 
                    path.join(indexDirPath, 'index.js')).replace('/\\/g', '/');
            this.console.log(`Created: ${indexRelPath}`);
        }

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

        let buildPromises = [];    
        for (let layoutPath of layoutPaths) {
            this._layoutPaths_ToBuild.remove(layoutPath);

            buildPromises.push((async () => {
                try {
                    let packageName = path.basename(path.join(layoutPath, '../..'));
                    let packagePath = this._packages[packageName].fsPath;

                    LayoutBuilder.Build(this, layoutPath, packagePath);
                } catch (err) {
                    this.console.error(`Cannot parse '${layoutPath}':`);
                    this.console.warn(err.stack);
                    return;
                }

                let relLayoutPath = path.relative(this.buildInfo.index, layoutPath)
                        .replace(/\\/g, '/');
                this.console.log('Built: ', relLayoutPath);
            })());
        }

        buildPromises.push((async () => {
            this._buildIndex();
        })());

        return Promise.all(buildPromises)
            .then(() => {
                this._header.clearTagsGroup_PostBody('spocky');

                // this._header.addTag('spocky', 'script', {
                //     src: this.uri(path.join(this._modulePath, 'js/spocky.js')),
                //     type: 'text/javascript',
                // }, '');

                // for (let layoutPath of this._layoutPaths) {
                //     let builtLayoutPath = path.join(path.dirname(layoutPath), 
                //             path.basename(layoutPath, '.html') + '.js');

                //     this._header.addTag('spocky', 'script', {
                //         src: this.uri(builtLayoutPath),
                //         type: 'text/javascript',
                //     }, '');
                // }
            })
            .then(() => {
                this.console.success('Finished.');
            });
    }

    __onChange(fsPaths, changes)
    {
        this._layoutPaths = fsPaths.layouts;
        if ('layouts' in changes) {
            for (let change of changes.layouts)
                this._layoutPaths_ToBuild.add(change.fsPath);
        }

        if ('packages' in changes) {
            for (let change of changes.packages) {
                let packageName = path.basename(change.fsPath);                
                let layoutPath = packageName in this._layoutOverrides ?
                        path.resolve(path.join(this._layoutOverrides[packageName], 'layouts/*.html')) :
                        path.join(change.fsPath, 'layouts/*.html');

                if (!this._layoutPaths_Watched.includes(layoutPath)) {
                    this._layoutPaths_Watched.push(layoutPath);
                    this.watch('layouts', [ 'add', 'unlink', 'change' ], this._layoutPaths_Watched);
                }

                this._packages[packageName] = {
                    fsPath: change.fsPath
                };
                this._jsLibs.addLib(packageName, path.join(change.fsPath, 'js-lib'));
            }
        }
        
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

        if ('layoutOverrides' in config)
            this._layoutOverrides = config.layoutOverrides;

        this._modulePath = config.path;
        this._layoutPaths_Watched = [];
        this._packages = {};

        let packagePaths = [];
        for (let fsPath of config.packages) {
            // layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            packagePaths.push(fsPath);
        }

        this.watch('layouts', [ 'add', 'unlink', 'change' ], this._layoutPaths_Watched);
        this.watch('packages', [ 'add' ], packagePaths);
    }

    __parse_Pre(config)
    {
        if (!('packages' in config))
            return;

        if (!('path' in config)) {
            this.console.error('Spockies module path not set.');
            return;
        }

        let packagePaths = [];
        for (let fsPath of config.packages) {
            let layoutsPath = path.join(fsPath, 'js-lib', '$layouts');
            if (fs.existsSync(layoutsPath)) {
                abFS.removeSync(layoutsPath);
                fs.mkdirSync(layoutsPath);
            }
        }
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Spocky;