'use strict';

const fs = require('fs');
const path = require('path');

const abFSWatcher = require('ab-fs-watcher');
const abTasks = require('ab-tasks');


class abWeb_Class {

    get Task() {
        return abTasks.Task;
    }


    constructor()
    { let self = this;
        this._buildInfo = null;
        this._config = new this._Config();

        this._extClasses = new Map();
        this._exts = new Map();

        this._watchers_Config = new abFSWatcher.Watcher();
        this._watchers_Config.on([ 'add', 'change' ], () => {
            self._parse();
        });

        this._tasks = new abTasks.Tasker();
        // this._tasks_Clean = this._createTask_Clean();
    }

    exec(config)
    {
        this._buildInfo = new this._BuildInfo(config._config, process.argv);

        this._findExts();
        this._importExts();

        this._watchers_Config.update([
            './ab-web.js',
        ]);

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

    import(ext_path)
    {
        if (this._exts.has(ext_path))
            return this._exts.get(ext_path);

        if (!this._extClasses.has(ext_path))
            throw new Error(`Ext \`${ext_path}\` does not exist.`);

        let ext =  new (this._extClasses.get(ext_path))(this, ext_path);
        this._exts.set(ext_path, ext);

        return ext;
    }


    _build()
    {
        for (let [ ext_path, ext ] of this._exts) {
            if (ext._tasks_Build !== null)
                this._tasks.call(ext._tasks_Build);
        }

        this._tasks.call(this._tasks_Build);
    }

    // _clean()
    // {
    //     for (let [ ext_path, ext ] of this._exts) {
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
        return new abTasks.Task('parse', () => {
            this.config.parse();
        });
    }

    _findExts()
    {
        /* Default Exts */
        let default_exts_path = path.resolve(path.join(__dirname, '../exts'));
        let ext_paths = fs.readdirSync(default_exts_path);
        for (let ext_path of ext_paths) {
            let ext_name = ext_path.substring('ab-web_'.length);
            this._extClasses.set(ext_name, require(path.join(
                    default_exts_path, ext_path)));
        }

        /* Node Exts */

        /* Local Exts */

    }

    _importExts()
    {
        for (let [ ext_path, ext_class ] of this._extClasses)
            this.import(ext_path);

        for (let [ ext_path, ext ] of this._exts)
            ext._init();
    }

    _parse()
    {
        let config_path = path.resolve('./ab-web.js');
        let config_require_path = require.resolve(config_path);

        if (config_require_path in require.cache)
            delete require.cache[config_require_path];

        this._config.parse(require(config_require_path));

        for (let [ ext_path, ext ] of this._exts) {
            let ext_config = {};
            if (ext_path in this._config._config)
                ext_config = this._config._config[ext_path];

            ext.__parse(ext_config);
        }
    }

}
module.exports = abWeb_Class.prototype;
require('./index._BuildInfo');
require('./index._Config');
require('./index.Ext');
module.exports = new abWeb_Class();
