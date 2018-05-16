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

        this.scriptPath = null;
        this.buildPath = null;

        this._libPaths = new Map();

        this._header.addTagGroup('js-libs', {
            before: [ 'js' ],
        });
    }

    addLib(libName, libPath)
    {
        if (!fs.existsSync(libPath)) {
            this.console.error(`Libs '${libName}' path does not exist: '${libPath}'.`);
            return;
        }

        this._libPaths.set(libName, libPath);

        this.watch(libName, [ 'add', 'unlink', 'change' ], path.join(
                libPath, '**/*.js'));
    }


    _createLib_Promise(libName, libPath)
    {
        return new Promise((resolve, reject) => {
            jsLibs.build(libName, libPath, path.join(
                    this.buildPath, libName), (err, builtFilePaths) => {
                if (err !== null) {
                    this.console.error(`Error when building \`${libName}\`.`,
                            err.stack);

                    reject(err);
                    return;
                }

                let buildUris = builtFilePaths.map((filePath) =>
                        this.uri(filePath, true));

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
            src: this.uri(this.scriptPath),
            type: 'text/javascript',
        }, '');

        let libPromises = [];
        for (let [ libName, libPath ] of this._libPaths)
            libPromises.push(this._createLib_Promise(libName, libPath));

        return Promise.all(libPromises)
            .then(() => {
                this.console.log('Libs:');
                for (let [ libName, libPath ] of this._libPaths) {
                    this.console.log(` - ${libName}`);
                }

                this._header.build();
            });
        // return new Promise((resolve, reject) => {
        //     Promise.all(libPromises)
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
        if (!fs.existsSync(config.path)) {
            this.console.error(`'path' in config does not exist: '${config.path}'.`);
            return;
        }
        this.scriptPath = config.path;

        this.buildPath = config.build.dev;

        if (!('libs' in config))
            return;

        let libs = config.libs;
        for (let libName in config.libs)
            this.addLib(libName, config.libs[libName]);

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JSLibs;
