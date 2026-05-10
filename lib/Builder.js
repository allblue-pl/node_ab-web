import path from "node:path";
import abLog from "ab-log";
import { Task, Tasker } from "ab-tasks";
import BuildData from "./BuildData.js";
import BuildSettings from "./BuildSettings.js";
export default class Builder {
    #buildSettings;
    #buildData;
    #exts;
    #tasker;
    #tasks_BuildEnd;
    #tasks_Parse;
    get settings() {
        return this.#buildSettings;
    }
    get _tasker() {
        return this.#tasker;
    }
    constructor(buildPreset, buildType) {
        this.#buildSettings = new BuildSettings(buildPreset, buildType);
        this.#buildData = new BuildData(this.#buildSettings);
        this.#exts = new Map();
        this.#tasker = new Tasker();
        this.#tasker.setWaitTime(this.#buildSettings.type === "rel" ? 5000 : 100);
        this.#tasks_BuildEnd = this.#createTask_BuildEnd();
        this.#tasks_Parse = this.#createTask_Parse();
    }
    build() {
        this.#build();
    }
    buildEnd() {
        this.#tasker.call(this.#tasks_BuildEnd, undefined);
    }
    isType(buildType) {
        return this.settings.type === buildType;
    }
    usesExt(extClass) {
        return this.#buildSettings.exts.includes(extClass);
    }
    watch() {
        abLog.log(`Starting 'ab-web' watch...`);
        abLog.log('Initializing extensions...');
        this.#initExts();
        this.#tasker.call(this.#tasks_Parse, undefined);
    }
    _getExt(extName) {
        let ext = this.#exts.get(extName);
        if (ext === undefined)
            return null;
        return ext;
    }
    #build() {
        for (let [extPath, ext] of this.#exts) {
            if (ext._tasks_Build !== null)
                this.#tasker.call(ext._tasks_Build, undefined);
        }
        this.buildEnd();
    }
    #createTask_BuildEnd() {
        return new Task('build', (argsArr) => {
            abLog.success('Build finished.');
            return true;
        })
            .waitFor('exts.*.build');
    }
    #createTask_Parse() {
        return new Task('parse', (argsArr) => {
            this.#parse();
            return true;
        });
    }
    #initExts() {
        for (let extClass of this.#buildSettings.exts) {
            // @ts-expect-error
            let ext = new extClass(this);
            this.#exts.set(ext.name, ext);
        }
        for (let [extName, ext] of this.#exts)
            ext.init();
    }
    #parse() {
        console.log('Parsing configs...');
        for (let initFn of this.#buildSettings.initFns)
            initFn(this.#buildData);
        for (let [extPath, ext] of this.#exts) {
            let extConfig = {};
            if (ext.name in this.#buildData.data)
                extConfig = this.#buildData.data[extPath];
            ext.__parse_Pre(extConfig);
        }
        for (let [extPath, ext] of this.#exts) {
            let extConfig = {};
            if (ext.name in this.#buildData.data)
                extConfig = this.#buildData.data[extPath];
            ext.__parse(extConfig);
        }
        console.log('Parsing configs finished.');
    }
}
