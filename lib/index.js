'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    abLog = require('ab-log'),
    abFSWatcher = require('ab-fs').watcher,
    abTasks = require('ab-tasks'),
    chalk = require('chalk'),
    js0 = require('js0'),

    Config = require('./Config'),
    Groups = require('./Groups')
;


class abWeb_Class {

    get Groups() {
        return Groups;
    }

    get Task() {
        return abTasks.Task;
    }


    constructor()
    { let self = this;
        this._buildInfo = null;
        this._config = new this._Config();

        this._extClasses = new Map();
        this._exts = new Map();

        this._tasks = new abTasks.Tasker();
        // this._tasks_Clean = this._createTask_Clean();
        this._tasks_Parse = this._createTask_Parse();

        this._watchers_Config = new abFSWatcher.Watcher();
        this._watchers_Config.on([ 'add', 'change' ], (fsPath) => {
            this._tasks.call(this._tasks_Parse, fsPath);
            // self._parse(fsPath);
        });
    }

    config()
    {
        return new Config();
    }

    exec(config, buildType = 'dev')
    {
        js0.args(arguments, null, js0.Enum([ 'dev', 'rel' ]));

        abLog.log(`Starting 'ab-web'...`);

        this._buildInfo = new this._BuildInfo(config._config, buildType);

        this._tasks.setWaitTime(this._buildInfo.type('rel') ? 5000 : 100);

        abLog.log('Finding extensions...');
        this._findExts();
        abLog.log('Importing extensions...');
        this._importExts(config.exts);

        this._watchers_Config.update(config.init);

        // let parsed_config = abTypes.conf(config, {
        //     front: {
        //         default: '.',
        //         type: 'string',
        //     },
        //     back: {
        //         default: '.',
        //         type: 'string',
        //     }
        // });

        // this._front = config.front;
        // this._back = config.back;
    }

    import(extPath)
    {
        if (this._exts.has(extPath))
            return this._exts.get(extPath);

        if (!this._extClasses.has(extPath))
            throw new Error(`Ext \`${extPath}\` does not exist.`);

        let ext =  new (this._extClasses.get(extPath))(this, extPath);
        this._exts.set(extPath, ext);

        abLog.log('Imported: ' + chalk.green(extPath));

        return ext;
    }


    _build()
    {
        for (let [ extPath, ext ] of this._exts) {
            if (ext._tasks_Build !== null)
                this._tasks.call(ext._tasks_Build);
        }

        this._tasks.call(this._tasks_Build);
    }

    // _clean()
    // {
    //     for (let [ extPath, ext ] of this._exts) {
    //         if (ext._tasks_Clean === null)
    //             continue;
    //
    //         this._tasks.call(ext._tasks_Clean);
    //     }
    //
    //     this._tasks.call(this._tasks_Clean);
    // }
    //
    // _createTask_CleanEnd()
    // { const self = this;
    //     return new abTasks.Task('clean', () => {
    //         console.log('Clean finished.');
    //     });
    // }
    //
    // _createTask_CleanStart()
    // { const self = this;
    //     return new abTasks.Task('clean', () => {
    //         console.log('Clean finished.');
    //     });
    // }

    _createTask_BuildEnd()
    {
        return new abTasks.Task('build', () => {
            console.log('Build finished.');
                })
            .waitFor('exts.*.build');
    }

    _createTask_Parse()
    {
        return new abTasks.Task('parse', (fsPaths) => {
            this._parse(fsPaths[fsPaths.length - 1][0]);
        });
    }

    _findExts()
    {
        /* Default Exts */
        let defaultExtsPath = path.resolve(path.join(__dirname, '../exts'));
        let extPaths = fs.readdirSync(defaultExtsPath);
        for (let extPath of extPaths) {
            let extName = extPath.substring('ab-web_'.length);
            this._extClasses.set(extName, require(path.join(
                    defaultExtsPath, extPath)));
        }

        /* Node Exts */

        /* Local Exts */

    }

    _importExts(exts)
    {
        js0.args(arguments, Array);

        let loadedExts = [];

        for (let [ extPath, extClass ] of this._extClasses) {
            if (!exts.includes(extPath))
                continue;

            this.import(extPath);
            loadedExts.push(extPath);
        }

        for (let extPath of exts) {
            if (!loadedExts.includes(extPath))
                abLog.error(`Cannot load ext '${extPath}'.`);
        }

        for (let [ extPath, ext ] of this._exts)
            ext._init();
    }

    _parse(fsPath)
    {
        let configPath = path.resolve(fsPath);
        let configRequirePath = require.resolve(configPath);

        if (configRequirePath in require.cache)
            delete require.cache[configRequirePath];

        // console.log(require(configRequirePath).getData());
        // return;

        this._config.parse(require(configRequirePath).getData());

        for (let [ extPath, ext ] of this._exts) {
            let extConfig = {};
            if (extPath in this._config._config)
                extConfig = this._config._config[extPath];

            ext.__parse_Pre(extConfig, configPath);
        }

        for (let [ extPath, ext ] of this._exts) {
            let extConfig = {};
            if (extPath in this._config._config)
                extConfig = this._config._config[extPath];

            ext.__parse(extConfig, configPath);
        }
    }

}
module.exports = abWeb_Class.prototype;
require('./index._BuildInfo');
require('./index._Config');
require('./index.Ext');
module.exports = new abWeb_Class();
