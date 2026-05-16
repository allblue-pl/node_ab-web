import path from "node:path";

import abLog from "ab-log";
import { Task, Tasker } from "ab-tasks";

import BuildData from "./BuildData.ts";
import BuildSettings from "./BuildSettings.ts";
import type Ext from "./Ext.ts";
import type { BuildPreset, BuildType } from "./ts-types.ts";


export default class Builder {
    #buildSettings: BuildSettings;
    #buildData: BuildData;
    #exts: Map<string, Ext>;
    #tasker: Tasker;
    #tasks_BuildEnd: Task<undefined>;
    #tasks_Parse: Task<undefined>;


    get settings(): BuildSettings {
        return this.#buildSettings;
    }

    get _tasker(): Tasker {
        return this.#tasker;
    }


    constructor(buildPreset: BuildPreset, buildType: "dev"|"rel") { 
        this.#buildSettings = new BuildSettings(buildPreset, buildType);
        this.#buildData = new BuildData(this.#buildSettings);

        this.#exts = new Map();

        this.#tasker = new Tasker();
        this.#tasker.setWaitTime(this.#buildSettings.type === "rel" ? 500 : 100);
        this.#tasks_BuildEnd = this.#createTask_BuildEnd();
        this.#tasks_Parse = this.#createTask_Parse();
    }

    build(): void {
        this.#build();
    }

    buildEnd(): void {
        this.#tasker.call(this.#tasks_BuildEnd, undefined);
    }

    isType(buildType: BuildType): boolean {
        return this.settings.type === buildType;
    }

    usesExt(extClass: typeof Ext): boolean {
        return this.#buildSettings.exts.includes(extClass);
    }

    watch(): void {
        abLog.log(`Starting 'ab-web' watch...`);

        abLog.log('Initializing extensions...');
        this.#initExts();

        this.#tasker.call(this.#tasks_Parse, undefined);

        setInterval(() => {
            let activeTasks = this.#tasker.getActiveTaskNames();

            if (activeTasks.executing.length > 0) {
                let executingTasks = activeTasks.executing.join(', ');
                console.log('Executing tasks:', executingTasks);
            }

            if (activeTasks.waiting.length > 0) {
                let waitingTasks = activeTasks.waiting.join(',');
                console.log('Waiting tasks:', waitingTasks);
            }
        }, 5000);
    }


    _getExt(extName: string): Ext|null {
        let ext = this.#exts.get(extName);
        if (ext === undefined)
            return null;

        return ext;
    }


    #build(): void {
        for (let [ extPath, ext ] of this.#exts) {
            if (ext._tasks_Build !== null)
                this.#tasker.call(ext._tasks_Build, undefined);
        }

        this.buildEnd();
    }

    #createTask_BuildEnd(): Task<undefined> {
        return new Task('buildEnd', (argsArr) => {
            abLog.success('Build finished.');
            return true;
                })
            .waitFor('exts.*.build');
    }

    #createTask_Parse(): Task<undefined> {
        return new Task('parse', (argsArr) => {
            this.#parse();
            return true;
        });
    }

    #initExts(): void {
        for (let extClass of this.#buildSettings.exts) {
            // @ts-expect-error
            let ext = new extClass(this) as Ext; 
            this.#exts.set(ext.name, ext);
        }

        for (let [ extName, ext ] of this.#exts) {
            ext.init();
            console.log(`${extName} initialized.`);
        }
    }

    #parse(): void {
        console.log('Parsing configs...');

        for (let initFn of this.#buildSettings.initFns)
            initFn(this.#buildData);

        for (let [ extPath, ext ] of this.#exts) {
            let extConfig = {};
            if (ext.name in this.#buildData.data)
                extConfig = this.#buildData.data[extPath];

            ext.__parse_Pre(extConfig);
        }

        for (let [ extPath, ext ] of this.#exts) {
            let extConfig = {};
            if (ext.name in this.#buildData.data)
                extConfig = this.#buildData.data[extPath];

            ext.__parse(extConfig);
        }

        console.log('Parsing configs finished.');
    }
}