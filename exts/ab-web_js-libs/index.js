'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('../../.');
const jsLibs = require('js-libs');


class abWeb_JSLibs extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._js = this.uses('js');

        this.scriptPath = null;
        this.buildPath = null;

        this._libPaths = new Map();
        this._scriptsToBuild = [];

        this._js.addScriptsGroup('js-libs', {
            before: [ 'js.js' ],
        });
    }

    addLib(libName, libPath)
    {
        if (!fs.existsSync(libPath)) {
            this.console.error(`Libs '${libName}' path does not exist: '${libPath}'.`);
            return;
        }

        this._libPaths.set(libName, libPath);
        this._js.addScriptsGroup(`js-libs.${libName}`, {
            after: [ 'js.js-libs' ],
        });

        this.watch(libName, [ 'add', 'unlink', 'change' ], 
                path.join(libPath, '**/*.js'));
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

                for (let builtFilePath of builtFilePaths) {
                    this._js.addScript(`js-libs.${libName}`, builtFilePath);
                }

                this.console.success(`\`${libName}\` built.`);
                resolve();
            });
        });
    }

    _createScript_Promise(scriptInfo)
    {
        let libPath = this._libPaths.get(scriptInfo.libName);

        return new Promise((resolve, reject) => {
            jsLibs.buildScript(scriptInfo.libName, libPath, path.join(
                    this.buildPath, scriptInfo.libName), scriptInfo.scriptPath, 
                    (err, builtFSPath) => {
                if (err !== null) {
                    this.console.error(`Error when building '${scriptInfo.libName}:` +
                            `${scriptInfo.scriptPath}'.`,
                            err.stack);

                    reject(err);
                    return;
                }

                if (scriptInfo.eventType !== 'change')
                    this._js.addScript(`js-libs.${scriptInfo.libName}`, builtFSPath);

                let relScriptPath = path.relative(this.buildInfo.index, scriptInfo.scriptPath)
                        .replace(/\\/g, '/');

                this.console.log(`Built: '${scriptInfo.libName}:${relScriptPath}'.`);
                resolve();
            });
        });
    }


    /* abWeb.Ext Overrides */
    __build()
    {
        this.console.info('Building.');

        let buildPromises = [];
        let buildJS = false;
        for (let scriptInfo of this._scriptsToBuild) {
            if (scriptInfo.eventType !== 'change')
                buildJS = true;

            buildPromises.push(this._createScript_Promise(scriptInfo));
        }
        this._scriptsToBuild = [];

        return Promise.all(buildPromises)
            .then(() => {
                if (!this.buildInfo.type('rel') && buildJS)
                    this._js.build();
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

    __onChange(fsPaths, changes)
    {
        for (let libName in changes) {
            for (let change of changes[libName]) {
                let scriptToBuildFound = false;
                for (let scriptInfo of this._scriptsToBuild) {
                    if (change.fsPath === scriptInfo.scriptPath) {
                        scriptToBuildFound = true;
                        break;
                    }
                }

                if (!scriptToBuildFound) {
                    this._scriptsToBuild.push({
                        libName: libName,
                        scriptPath: change.fsPath,
                        eventType: change.eventType,
                    });
                }
            }
        }

        this.build();
    }

    __parse(config, configPath)
    {
        let scriptPath = path.join(path.dirname(configPath), config.path);

        if (!fs.existsSync(scriptPath)) {
            this.console.error(`'path' in config does not exist: '${config.path}'.`);
            return;
        }
        this.scriptPath = scriptPath;

        this.buildPath = config.build.dev;

        if (!('libs' in config))
            return;

        let libs = config.libs;
        for (let libName in config.libs)
            this.addLib(libName, config.libs[libName]);

        this._js.clearScriptsGroup('js-libs');
        this._js.addScript('js-libs', this.scriptPath);

        this.build();
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_JSLibs;
