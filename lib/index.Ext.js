'use strict';

const abWeb = require('./index');

const path = require('path');

const abFSWatcher = require('ab-fs').watcher;
const chalk = require('chalk');


Object.defineProperties(abWeb, {

    Ext: { value:
    class abWeb_Ext
    {

        get buildInfo() {
            return this._abWeb._buildInfo;
        }


        constructor(abWeb, extPath)
        { let self = this;
            let afterBuildTaskName = `exts.${extPath}.afterBuild`;
            let buildTaskName = `exts.${extPath}.build`;
            let cleanTaskName = `exts.${extPath}.clean`;
            let onChangeTaskName = `exts.${extPath}.onChange`;

            Object.defineProperties(this, {
                path: { value: extPath, },
                console: { value: new abWeb.ExtConsole(this), },

                _abWeb: { value: abWeb, },

                _initialized: { value: false, writable: true, },

                _listeners_AfterBuild: { value: [], },

                _tasks_AfterBuild: { value: new abWeb.Task(afterBuildTaskName, () => {
                    for (let listener of this._listeners_AfterBuild)
                        listener();
                })},
                _tasks_Build: { 
                    value: new abWeb.Task(buildTaskName, () => {
                        return self.__build();
                            })
                        .waitFor('parse')
                },
                _tasks_Clean: { value: new abWeb.Task(onChangeTaskName, () => {
                    return self.__clean();
                })},
                _tasks_OnChange: { value: new abWeb.Task(onChangeTaskName,
                        (argsArr) => {
                    // console.log(argsArr.layouts);
                    let lastArgs = argsArr[argsArr.length - 1];
                    let fsPaths = lastArgs[0];

                    let changes = {};
                    for (let args of argsArr) {
                        if (!(args[1] in changes))
                            changes[args[1]] = [];

                        let fsPathFound = false;
                        for (let change of changes[args[1]]) {
                            if (args[2] === change.fsPath) {
                                fsPathFound = true;
                                break;
                            }
                        }

                        if (!fsPathFound) {
                            changes[args[1]].push({
                                fsPath: args[2],
                                eventType: args[3],
                            });
                        }
                    }
                    // let eventTypes = lastArgs.map((args) => ({
                    //     name: args[1],
                    //     type: args[2],
                    // }));
                    // lastArgs.push(argsArr);

                    return self.__onChange(fsPaths, changes);
                })},

                _watchers: { value: new Map(), },
            });

            this._tasks_Build.chain(this._tasks_AfterBuild);

            this._abWeb._exts.set(extPath, this);
        }

        afterBuild(listener)
        {
            this._listeners_AfterBuild.push(listener);
        }

        build()
        {
            this._abWeb._tasks.call(this._tasks_Build);
        }

        clean()
        {
            this._abWeb._tasks.call(this._tasks_Clean);
        }

        unwatch(watcherName)
        {
            if (watcherName in this._watchers) {
                this._watchers.get(watcherName).finish();
                this._watchers.delete(watcherName);
            }
        }

        uri(fsPath, addHash = true)
        {
            let relative_path = path.relative(this.buildInfo.index, fsPath);
            let uri = relative_path.replace(/\\/g, '/');
            return this.buildInfo.base +  uri + (addHash ?
                    `?v=${this.buildInfo.hash}` : '');
        }

        uses(ext_name)
        {
            if (this._initialized)
                throw new Error('Cannot declare used exts after init.');

            return this._abWeb.import(ext_name);
        }

        watch(watcherName, eventTypes, pathPatterns)
        { let self = this;
            if (!this._watchers.has(watcherName)) {
                let watcher =  new abFSWatcher.Watcher();
                this._watchers.set(watcherName, watcher);

                watcher.on(eventTypes, (fsPath, eventType) => {
                    let fsPaths = {};
                    for (let [ tWatcherName, tWatcher ] of self._watchers)
                        fsPaths[tWatcherName] = tWatcher.getFSPaths();

                    self._abWeb._tasks.call(self._tasks_OnChange, fsPaths,
                            watcherName, fsPath, eventType);
                });
            }

            this._watchers.get(watcherName).update(pathPatterns);
        }


        _init()
        {
            this._initialized = true;
            this.__onInit();

            // let buildTaskName = `exts.${this.path}.build`;
            // let cleanTaskName = `exts.${this.path}.clean`;
            //
            // this._tasks_Build = this.__buildTask(buildTaskName);
            // if (this._tasks_Build !== null) {
            //     if (this._tasks_Build.name !== buildTaskName)
            //         throw new Error('Wrong build task name.');
            // }
            //
            // this._tasks_Clean = this.__cleanTask(cleanTaskName);
            // if (this._tasks_Clean !== null) {
            //     if (this._tasks_Clean.name !== cleanTaskName)
            //         throw new Error('Wrong clean task name.');
            // }
        }

        __build()
        {
            return null;
        }

        __clean()
        {
            return null;
        }

        __onChange(fsPaths, changes)
        {
            this.build();
        }

        __onInit()
        {
            return;
        }

        __parse(config)
        {
            return;
        }

        __parse_Pre(config)
        {
            return;
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
            for (var i = 1; i < arguments.length; i++) {
                let arg = arguments[i];
                
                if (typeof arg.toString === 'function')
                    arg = arg.toString();

                if (typeof arg === 'string') {
                    let strArr = arg.split('\n');
                    for (let i = 1; i < strArr.length; i++) {
                        let line = '';
                        for (let j = 0; j < this._logPrefix.length / 2; j++)
                            line += ' ';
                        strArr[i] = line + strArr[i];
                    }

                    arg = strArr.join('\n');
                }

                args.push(chalk[color](arg));
            }

            console.log.apply(console, args);
        }

        error() {
            var args = [ 'red' ];
            for (var i in arguments)
                args.push(arguments[i]);

            this.color.apply(this, args);
        }

        info() {
            var args = [ 'cyan' ];
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
