'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('../../.');
const jsLibs = require('js-libs');


class abWeb_JSLibs extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._scriptPath = null;
        this._buildPath = null;

        this._libPaths = null;

        this._header.addTagGroup('js-libs', {
            before: [ 'js' ],
        });
    }

    _createLib_Promise(libName, libPath)
    {
        return new Promise((resolve, reject) => {
            jsLibs.build(libName, libPath, path.join(
                    this._buildPath, libName), (err, builtFilePaths) => {
                if (err !== null) {
                    this.console.error(`Error when building \`${libName}\`.`,
                            err.stack);

                    reject(err);
                    return;
                }

                let buildUris = builtFilePaths.map((filePath) =>
                        this.uri(filePath));

                for (let buildUri of buildUris) {
                    this._header.addTag('js-libs', 'script', {
                        src: buildUri,
                        type: 'text/javascript',
                    }, '');
                }

                this.console.success(`\`${libName}\` built.`);
                resolve();
            });
        });
    }


    /* abWeb.Ext Overrides */
    __build()
    {
        this.console.info('Building.');

        this._header.clearTags('js-libs');

        this._header.addTag('js-libs', 'script', {
            src: this.uri(this._scriptPath),
            type: 'text/javascript',
        }, '');

        let lib_promises = [];
        for (let [ libName, libPath ] of this._libPaths)
            lib_promises.push(this._createLib_Promise(libName, libPath));

        return Promise.all(lib_promises)
            .then(() => {
                this.console.log('Libs:');
                for (let [ libName, libPath ] of this._libPaths) {
                    this.console.log(` - ${libName}`);
                }

                this._header.build();
            });
        // return new Promise((resolve, reject) => {
        //     Promise.all(lib_promises)
        //         .then((results) => {
        //             console.log('Here', results);
        //             for (let result of results) {
        //                 if (result instanceof Error) {
        //                     reject(new Error(`Cannot build all \`ab-libs\`.`));
        //                     return;
        //                 }
        //
        //                 console.log(result);
        //             }
        //
        //             console.log('Here?');
        //             resolve();
        //         })
        //         .catch((err) => {
        //             console.log('HM?', err);
        //             reject(err);
        //         });
        // });
    }

    __parse(config)
    {
        this._scriptPath = config.path;
        this._buildPath = config.build.dev;

        if (!('libs' in config))
            return;

        let libs = config.libs;
        this._libPaths = new Map();
        for (let libName in config.libs) {
            let libPath = path.join(config.libs[libName], 'js-lib');
            this._libPaths.set(libName, libPath);

            this.watch(libName, [ 'add', 'unlink', 'change' ], path.join(
                    libPath, '**/*.js'));
        }

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JSLibs;
