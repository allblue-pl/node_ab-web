import { TS0AssertError } from "@allblue/ts0";
import { Watcher } from "ab-fs-watcher";
import { Task } from "ab-tasks";
import chalk from "chalk";
import path from "node:path";
                                        
                                                      
                                                                                            
                                                                    
import abLog from "ab-log";

export default          class Ext {
    #builder         ;
    #console            ;
    #debugMessages                   ;
    #initialized         ;
    #listeners_AfterBuild                   ;
    #tasks_AfterBuild                 ;
    #tasks_Build                 ;
    #tasks_Clean                 ;
    #tasks_OnChange                         ;
    #watchers                      ;
    

    get builder()          {
        return this.#builder;
    }

    get name()         {
        return this.__getName();
    }


    get _tasks_Build()                  {
        return this.#tasks_Build;
    }


    constructor(builder         ) {
        let afterBuildTaskName = `exts.${this.name}.afterBuild`;
        let buildTaskName = `exts.${this.name}.build`;
        // let cleanTaskName = `exts.${this.name}.clean`;
        let onChangeTaskName = `exts.${this.name}.onChange`;

        this.#builder = builder;
        this.#console = new ExtPrinter(this);
        this.#debugMessages = [];
        this.#initialized = false;
        this.#listeners_AfterBuild = [];

        this.#tasks_AfterBuild = new Task(afterBuildTaskName, (_) => {
            for (let listener of this.#listeners_AfterBuild)
                listener();
            return true;
        });
        this.#tasks_Build = new Task(buildTaskName, () => {
            return this.__build();
                })
            .waitFor('parse')
            .chain(this.#tasks_AfterBuild, undefined);
        this.#tasks_Clean = new Task(onChangeTaskName, () => {
            return this.__clean();
        });
        this.#tasks_OnChange = new Task(
                onChangeTaskName, (argsArr) => {
            let changes              = {};
            for (let args of argsArr) {
                if (!(args.watcherName in changes))
                    changes[args.watcherName] = [];

                let fsPath_Exists = false;
                for (let changeInfo of changes[args.watcherName]) {
                    if (args.fsPath === changeInfo.fsPath) {
                        changeInfo.eventTypes.push(args.eventType);
                        fsPath_Exists = true;
                        break;
                    }
                }

                if (!fsPath_Exists) {
                    changes[args.watcherName].push({
                        fsPath: args.fsPath,
                        eventTypes: [ args.eventType ],
                    });
                }
            }

            return this.__onChange(changes);
        });

        this.#watchers = new Map();
    }

    afterBuild(listener            )       {
       this.#listeners_AfterBuild.push(listener);
    }

    build()       {
        this.#builder._tasker.call(this.#tasks_Build, undefined);
        this.#builder.buildEnd();
    }

    clean()       {
        this.#builder._tasker.call(this.#tasks_Clean, undefined);
    }

    clearDebug()       {
        this.#debugMessages = [];
    }

    debug(...messages            )       {
        this.#debugMessages.push(messages);
    }

    getWatchedFSPaths()                                {
        let fsPaths                                = {};
        for (let [ tWatcherName, tWatcher ] of this.#watchers)
            fsPaths[tWatcherName] = tWatcher.getFSPaths();

        return fsPaths;
    }

    getWatchedFSPatterns()                                {
        let fsPatterns                                = {};
        for (let [ tWatcherName, tWatcher ] of this.#watchers)
            fsPatterns[tWatcherName] = tWatcher.getFSPatterns();

        return fsPatterns;
    }

    init()       {
        if (this.#initialized)
            throw new Error(`Extension '${this.name}' already initialized.`);

        this.#initialized = true;
        this.__onInit();
    }

    printDebug()       {
        for (let messages of this.#debugMessages) {
            let messages_T = messages.slice();
            messages_T.splice(0, 0, `DEBUG (${this.name}):`);
            abLog.info.apply(abLog, messages_T);
        }
    }

    printLogs()       {
        this.__printLogs(this.#console);
    }

    printErrors()       {
        this.__printErrors(this.#console);
    }

    unwatch(watcherName        )       {
        let watcher = this.#watchers.get(watcherName);
        if (watcher === undefined)
            throw new Error(`Watcher '${watcherName}' does not exist.`);

        watcher.finish();
        this.#watchers.delete(watcherName);
    }

    uri(fsPath        , addHash          = true, error              = null)         {
        let settings = this.#builder.settings;

        let relativePath = path.relative(settings.config.index, 
                fsPath).replace(/\\/g, '/');
        
        return settings.config.base + relativePath + (addHash ?
                `?v=${settings.buildHash}` : '');
    }

    uses(extName        )      {
        if (this.#initialized)
            throw new Error('Cannot declare used exts after init.');

        let ext = this.#builder._getExt(extName);
        if (ext === null)
            throw new Error(`Ext '${this.name}' dependency not loaded.`);

        return ext;
    }

    watch(watcherName        , eventTypes                       , 
            pathPatterns               )       {
        let watcher =  this.#watchers.get(watcherName);
        if (watcher === undefined) {
            watcher = new Watcher();
            this.#watchers.set(watcherName, watcher);

            watcher.on(eventTypes, (fsPath, eventType) => {
                this.#builder._tasker.call(this.#tasks_OnChange, {
                    watcherName: watcherName,
                    fsPath: fsPath,
                    eventType: eventType,
                });
            });
        }

        watcher.update(pathPatterns);
    }


    __build()                           {
        return true;
    }

    __clean()                           {
        return true;
    }

    __onChange(changeInfos             )          {
        this.build();
        return true;
    }

    __onInit()       {
        return;
    }

    __parse(extConfig        )          {
        this.build();
        return true;
    }

    __parse_Pre(extConfig        )          {
        return true;
    }

    __printLogs(printer            )       {
        
    }

    __printErrors(printer            )       {
        
    }


                                 
}

export class ExtPrinter {
    get #logPrefix()         {
        return chalk.magenta(this.#ext.name + ': ');
    }


    #ext     ;


    constructor(ext     ) {
        this.#ext = ext;
    }

    color(color            , ...args               )       {
        var logArgs                = [ this.#logPrefix ];
        for (let arg of args)
            logArgs.push(chalk[color](arg)          );
        // for (let arg of args) {
        //     if (typeof arg.toString === 'function')
        //         arg = arg.toString();

        //     if (typeof arg === 'string') {
        //         let strArr = arg.split('\n');
        //         for (let i = 1; i < strArr.length; i++) {
        //             let line = '';
        //             for (let j = 0; j < this.#logPrefix.length / 2; j++)
        //                 line += ' ';
        //             strArr[i] = line + strArr[i];
        //         }

        //         arg = strArr.join('\n');
        //     }

        //     logArgs.push(chalk[color](arg) as string);
        // }

        console.log.apply(console, logArgs);
    }

    debug(...args            )       {
        this.color("redBright", ...args);
    }

    error(...args               )       {
        this.color("red", ...args);
    }

    info(...args               )       {
        this.color("cyan", ...args);
    }

    log(...args               )       {
        console.log(this.#logPrefix, ...args);
    }

    success(...args               )       {
        this.color("green", ...args);
    }

    warn(...args               )       {
        this.color("yellow", ...args);
    }
}