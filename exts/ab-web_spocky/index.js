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
        this._jsLibs = this.uses('js-libs');

        this._modulePath = null;

        this._layoutPaths = [];
        this._layoutPaths_ToBuild = new js0.List();
        this._indexLayoutPaths = [];
        this._packagePaths = [];

        this._header.addTagsGroup('spocky', {
            
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
            let layoutDirPath = path.join(path.dirname(layoutPath), 
                    '../js-lib/$layouts');
            
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
                    LayoutBuilder.Build(this, layoutPath);
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

        buildPromises.push((async () => {
            this._buildIndex();
        })());

        return Promise.all(buildPromises)
            .then(() => {
                this._header.clearTagsGroup('spocky');

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
                this._jsLibs.addLib(path.basename(change.fsPath), 
                        path.join(change.fsPath, 'js-lib'));
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

        this._modulePath = config.path;

        let layoutPaths = [];
        let packagePaths = [];
        for (let fsPath of config.packages) {
            layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            packagePaths.push(fsPath);
        }

        this.watch('layouts', [ 'add', 'unlink', 'change' ], layoutPaths);
        this.watch('packages', [ 'add' ], packagePaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Spocky;