import { AssertError } from "@allblue/ts0";
import { Watcher } from "ab-fs-watcher";
import { Task } from "ab-tasks";
import chalk from "chalk";
import path from "node:path";
import type Builder from "./Builder.ts";
import type ConfigSettings from "./ConfigSettings.ts";
import type { ChalkColor, ChangeInfo, ChangeInfos, TaskArgs_OnChange } from "./ts-types.ts";
import type { WatchEventType } from "ab-fs-watcher/lib/ts-types.js";


export default abstract class Ext {
    #builder: Builder;
    #console: ExtConsole;
    #initialized: boolean;
    #listeners_AfterBuild: Array<() => void>;
    #tasks_AfterBuild: Task<undefined>;
    #tasks_Build: Task<undefined>;
    #tasks_Clean: Task<undefined>;
    #tasks_OnChange: Task<TaskArgs_OnChange>;
    #watchers: Map<string, Watcher>;


    get builder(): Builder {
        return this.#builder;
    }

    get console(): ExtConsole {
        return this.#console;
    }

    get name(): string {
        return this.__getName();
    }


    get _tasks_Build(): Task<undefined> {
        return this.#tasks_Build;
    }


    constructor(builder: Builder) {
        let afterBuildTaskName = `exts.${this.name}.afterBuild`;
        let buildTaskName = `exts.${this.name}.build`;
        // let cleanTaskName = `exts.${this.name}.clean`;
        let onChangeTaskName = `exts.${this.name}.onChange`;

        this.#builder = builder;
        this.#console = new ExtConsole(this);
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
            let changes: ChangeInfos = {};
            for (let args of argsArr) {
                if (!(args.watcherName in changes))
                    changes[args.watcherName] = [];

                for (let i = changes[args.watcherName].length - 1; i >= 0; i--) {
                    if (args.fsPath === changes[args.watcherName][i].fsPath) {
                        changes[args.watcherName].splice(i, 1);
                        break;
                    }
                }

                changes[args.watcherName].push({
                    fsPath: args.fsPath,
                    eventType: args.eventType,
                });
            }

            return this.__onChange(changes);
        });

        this.#watchers = new Map();
    }

    afterBuild(listener: () => void) {
       this.#listeners_AfterBuild.push(listener);
    }

    build() {
        this.#builder._tasker.call(this.#tasks_Build, undefined);
        this.#builder.buildEnd();
    }

    clean() {
        this.#builder._tasker.call(this.#tasks_Clean, undefined);
    }

    getWatchedFSPaths(): {[key:string]: Array<string>} {
        let fsPaths: {[key:string]: Array<string>} = {};
        for (let [ tWatcherName, tWatcher ] of this.#watchers)
            fsPaths[tWatcherName] = tWatcher.getFSPaths();

        return fsPaths;
    }

    getWatchedFSPatterns(): {[key:string]: Array<string>} {
        let fsPatterns: {[key:string]: Array<string>} = {};
        for (let [ tWatcherName, tWatcher ] of this.#watchers)
            fsPatterns[tWatcherName] = tWatcher.getFSPatterns();

        return fsPatterns;
    }

    init(): void {
        if (this.#initialized)
            throw new Error(`Extension '${this.name}' already initialized.`);

        this.#initialized = true;
        this.__onInit();
    }

    unwatch(watcherName: string) {
        let watcher = this.#watchers.get(watcherName);
        if (watcher === undefined)
            throw new Error(`Watcher '${watcherName}' does not exist.`);

        watcher.finish();
        this.#watchers.delete(watcherName);
    }

    uri(fsPath: string, addHash: boolean = true) {
        let settings = this.#builder.settings;

        let relativePath = path.relative(settings.config.index, 
                fsPath);
        let uri = relativePath.replace(/\\/g, '/');
        return settings.config.base +  uri + (addHash ?
                `?v=${settings.hash}` : '');
    }

    uses(extName: string): Ext {
        if (this.#initialized)
            throw new Error('Cannot declare used exts after init.');

        let ext = this.#builder._getExt(extName);
        if (ext === null)
            throw new Error(`Ext '${this.name}' dependency not loaded.`);

        return ext;
    }

    watch(watcherName: string, eventTypes: Array<WatchEventType>, 
            pathPatterns: Array<string>): void {
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


    __build(): boolean|Promise<boolean> {
        return true;
    }

    __clean(): boolean|Promise<boolean> {
        return true;
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        this.build();
        return true;
    }

    __onInit(): void {
        return;
    }

    __parse(extConfig: object): boolean {
        this.build();
        return true;
    }

    __parse_Pre(extConfig: object): boolean {
        return true;
    }


    abstract __getName(): string;
}

class ExtConsole {
    get _logPrefix(): string {
        return chalk.magenta(this.#ext.name + ':  ');
    }


    #ext: Ext;


    constructor(ext: Ext) {
        this.#ext = ext;
    }

    color(color: ChalkColor, ...args: Array<string>): void {
        var logArgs: Array<string> = [ this._logPrefix ];
        for (let arg of args) {
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

            logArgs.push(chalk[color](arg) as string);
        }

        console.log.apply(console, logArgs);
    }

    debug(...args: Array<any>): void {
        this.color("redBright", ...args);
    }

    error(...args: Array<string>): void {
        this.color("red", ...args);
    }

    info(...args: Array<string>): void {
        this.color("cyan", ...args);
    }

    log(...args: Array<string>): void {
        console.log(this._logPrefix, ...args);
    }

    success(...args: Array<string>): void {
        this.color("green", ...args);
    }

    warn(...args: Array<string>): void {
        this.color("yellow", ...args);
    }
}