'use strict';

const abWeb = require('./index');

const abFSWatcher = require('ab-fs-watcher');
const chalk = require('chalk');


Object.defineProperties(abWeb, {

    Ext: { value:
    class abWeb_Ext
    {

        get buildInfo() {
            return this._abWeb._buildInfo;
        }


        constructor(ab_web, ext_path)
        {
            Object.defineProperties(this, {
                path: { value: ext_path, },
                console: { value: new abWeb.ExtConsole(this), },

                _abWeb: { value: ab_web, },

                _initialized: { value: false, writable: true, },

                _tasks_Build: { value: null, writable: true, },
                _tasks_Clean: { value: null, writable: true, },

                _watchers: { value: new Map(), },
            });
            this._abWeb._exts.set(ext_path, this);
        }

        build()
        {
            this._abWeb._tasks.call(this._tasks_Build);
        }

        clean()
        {
            this._abWeb._tasks.call(this._tasks_Clean);
        }

        unwatch(watcher_name)
        {
            if (watcher_name in this._watchers) {
                this._watchers.get(watcher_name).finish();
                this._watchers.delete(watcher_name);
            }
        }

        watch(watcher_name, event_types, path_patterns)
        { let self = this;
            if (!this._watchers.has(watcher_name)) {
                let watcher =  new abFSWatcher.Watcher();
                this._watchers.set(watcher_name, watcher);

                watcher.on(event_types,
                        () => {
                    let fs_paths = {};
                    for (let [ t_watcher_name, t_watcher ] of self._watchers) {
                        fs_paths[t_watcher_name] = t_watcher.getFilePaths();
                        self.__onChange(fs_paths);
                    }
                });
            }

            this._watchers.get(watcher_name).update(path_patterns);
        }


        _init()
        {
            this._initialized = true;

            let build_task_name = `exts.${this._path}.build`;
            let clean_task_name = `exts.${this._path}.clean`;

            this._tasks_Build = this.__buildTask(build_task_name);
            if (this._tasks_Build !== null) {
                if (this._tasks_Build.name !== build_task_name)
                    throw new Error('Wrong build task name.');
            }

            this._tasks_Clean = this.__cleanTask(clean_task_name);
            if (this._tasks_Clean !== null) {
                if (this._tasks_Clean.name !== clean_task_name)
                    throw new Error('Wrong clean task name.');
            }
        }

        __buildTask()
        {
            return null;
        }

        __cleanTask()
        {
            return null;
        }

        __parse(config)
        {
            return;
        }

        __uses(ext_name)
        {
            if (this._initialized)
                throw new Error('Cannot declare used exts after init.');

            return this._abWeb.import(ext_name);
        }

    }},

    ExtConsole: { value:
    class abWeb_ExtConsole {

        get _logPrefix() {
            return chalk.magenta(this._ext.path + ':  ');
        }


        constructor(ext)
        {
            this._ext = ext;
        }

        color(color) {
            var args = [ this._logPrefix ];
            for (var i = 1; i < arguments.length; i++)
                args.push(chalk[color](arguments[i]));

            console.log.apply(console, args);
        }

        error() {
            var args = [ 'red' ];
            for (var i in arguments)
                args.push(arguments[i]);

            this.color.apply(this, args);
        }

        log() {
            var args = [ this._logPrefix ];
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);

            console.log.apply(console, args);
        }

        success() {
            var args = [ 'green' ];
            for (var i in arguments)
                args.push(arguments[i]);

            this.color.apply(this, args);
        }

        warn() {
            var args = [ 'yellow' ];
            for (var i in arguments)
                args.push(arguments[i]);

            this.color.apply(this, args);
        }

    }},

});
module.exports = abWeb.Ext;
