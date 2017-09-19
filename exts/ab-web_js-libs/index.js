'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('ab-web');
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

    _createLib_Promise(lib_name, lib_path)
    {
        new Promise((resolve, reject) => {
            jsLibs.build(lib_name, lib_path, path.join(
                    this._buildPath, lib_name), (err, built_file_paths) => {
                if (err !== null) {
                    this.console.error(`Error when building \`${lib_name}\`.`,
                            err.stack);

                    reject(err);
                    return;
                }

                let built_uris = built_file_paths.map((file_path) =>
                        this.uri(file_path));

                for (let built_uri of built_uris) {
                    this._header.addTag('js-libs', 'script', {
                        src: built_uri,
                        type: 'text/javascript',
                    }, '');
                }

                this.console.success(`\`${lib_name}\` built.`);
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
        for (let [ lib_name, lib_path ] of this._libPaths)
            lib_promises.push(this._createLib_Promise(lib_name, lib_path));

        return Promise.all(lib_promises);
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
        for (let lib_name in config.libs) {
            let lib_path = path.join(config.libs[lib_name], 'js-lib');
            this._libPaths.set(lib_name, lib_path);

            this.watch(lib_name, [ 'add', 'unlink', 'change' ], path.join(
                    lib_path, '**/*.js'));
        }

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JSLibs;
