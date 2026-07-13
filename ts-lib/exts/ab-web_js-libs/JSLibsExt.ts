import path from "node:path";
import type Builder from "../../Builder.ts";
import Ext, { ExtPrinter } from "../../Ext.ts";
import type JSExt from "../ab-web_js/JSExt.ts";
import fs from "node:fs";
import babel from "@babel/core";
import { presets_JSPkgInfos, presets_TSPkgInfos, type JSPkgInfos, type LibInfo, type ScriptInfo, type TSPkgInfos } from "./ts-types.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
import ts0, { ts0Assert } from "@allblue/ts0";
import { JSLibsBuilder } from "js-libs";

export default class JSLibsExt extends Ext {
    #js: JSExt;

    #buildFSPath: string|null;
    #projectFSPath: string;
    #libBuilder: JSLibsBuilder;

    #libInfos: Map<string, LibInfo>;
    #scriptsToBuild: Array<ScriptInfo>;

    #print_Errors: Array<string>;
    #print_LibErrors: {[libName: string]: Array<string>};
    #print_ScriptErrors: {[libName:string]: {[fsPath: string]: Array<string>}};
    #print_ScriptLogs: {[libName:string]: {[fsPath: string]: string}};


    get buildFSPath(): string {
        ts0Assert(this.#buildFSPath !== null);

        return this.#buildFSPath;
    }

    get libBuilder(): JSLibsBuilder {
        return this.#libBuilder;
    }


    constructor(builder: Builder) { 
        super(builder);
        
        this.#js = this.uses('js') as JSExt;

        this.#buildFSPath = null;
        this.#projectFSPath = "";
        this.#libBuilder = new JSLibsBuilder();

        this.#libInfos = new Map();
        this.#scriptsToBuild = [];

        this.#js.addScriptsGroup('js-libs', {
            before: [ 'js.compile.js' ],
            values: [],
        });

        this.#print_ScriptLogs = {};

        this.#print_LibErrors = {};
        this.#print_ScriptErrors = {};
        this.#print_ScriptLogs = {};
        this.#print_Errors = [];
    }


    addLib(libName: string, libFSPath: string, libType: "ts"|"js", 
            tsconfigFSPath: string|null = null, legacyJS: boolean = false): void {
        // let libName = path.basename(libFSPath);
        if (this.#libInfos.has(libName)) {
            this.#print_LibErrors[libName] = [ `Lib '${libName}' already exists.` ];
            return;
        }

        delete this.#print_LibErrors[libName];
        this.#print_ScriptErrors[libName] = {};
        this.#print_ScriptLogs[libName] = {};

        if (!fs.existsSync(libFSPath)) {
            this.#print_LibErrors[libName] = [ `Lib '${libName}' path does` + 
                    ` not exist: '${libFSPath}'.` ];
            return;
        }

        if (libType === "js") {
            this.#libInfos.set(libName, {
                type: "js",
                libName: libName,
                libFSPath: libFSPath,
                tsconfigFSPath: null,
            });
        } else {
            this.#libInfos.set(libName, {
                type: "ts",
                libName: libName,
                libFSPath: libFSPath,
                tsconfigFSPath: tsconfigFSPath,
            });
        }

        this.#js.addScriptsGroup(`js-libs.${libName}`, {
            after: [ 'js.compile.js-libs' ],
            values: [],
        });

        if (libType === "js") {
            if (legacyJS) {
                this.watch(libName, [ 'add', 'unlink', 'change' ], [ 
                    `${libFSPath}/**/*.js`,
                ]);
            } else {
                this.watch(libName, [ 'add', 'unlink', 'change' ], [ 
                    `${libFSPath}/**/*.js`,
                ]);
            }
        } else {
            this.watch(libName, [ 'add', 'unlink', 'change' ], [ 
                `${libFSPath}/**/*.ts`,
            ]);
        }
    }

    getLibInfo(libName: string): LibInfo {
        let libInfo = this.#libInfos.get(libName);
        ts0Assert(libInfo !== undefined);

        return libInfo;
    }

    async #script_Create_Async(scriptInfo: ScriptInfo): Promise<boolean> {
        this.#print_LibErrors[scriptInfo.libName] = [];
        this.#print_ScriptErrors[scriptInfo.libName][scriptInfo.scriptFSPath] = [];
        this.#print_ScriptLogs[scriptInfo.libName][scriptInfo.scriptFSPath]

        let libInfo = this.#libInfos.get(scriptInfo.libName);
        ts0Assert(libInfo !== undefined, `Lib '${scriptInfo.libName}' does not exist.`);

        if (this.#buildFSPath === null)
            throw new Error("Build path not set.");

        try {
            let buildResult = await this.#libBuilder.buildScript_Async(this.#projectFSPath,
                    scriptInfo.libName, libInfo.libFSPath, scriptInfo.scriptFSPath,
                    path.join(this.#buildFSPath, scriptInfo.libName), 
                    libInfo.tsconfigFSPath, this.builder.isType("dev"));

            for (let libError of buildResult.validationErrors)
                this.#print_LibErrors[scriptInfo.libName].push(libError);

            for (let scriptError of buildResult.scriptErrors) {
                this.#print_ScriptErrors[scriptInfo.libName][scriptInfo.scriptFSPath]
                        .push(scriptError);
            }

            if (scriptInfo.eventTypes.includes("add")) {
                this.#js.addScript(`js-libs.${scriptInfo.libName}`, 
                        buildResult.scriptFSPath);
            }

            let relScriptPath = path.relative(this.builder.settings.config.index, 
                    scriptInfo.scriptFSPath).replace(/\\/g, '/');

            this.#print_ScriptLogs[scriptInfo.libName][scriptInfo.scriptFSPath] = 
                    `${relScriptPath}`;
        } catch (err) {
            this.#print_ScriptErrors[scriptInfo.libName][scriptInfo.scriptFSPath] = [
                    `Error when building '${scriptInfo.libName}:` +
                    `${scriptInfo.scriptFSPath}': \r\n` + 
                    (err as Error).stack as string ];
            return false;
        }

        return true;
    }

    #script_Remove(scriptInfo: ScriptInfo): void {
        delete this.#print_LibErrors[scriptInfo.libName];
        delete this.#print_ScriptErrors[scriptInfo.libName][scriptInfo.scriptFSPath];
        delete this.#print_ScriptLogs[scriptInfo.libName][scriptInfo.scriptFSPath];

        if (this.#buildFSPath === null)
            throw new Error("Build path not set.");

        let libInfo = this.#libInfos.get(scriptInfo.libName);
        ts0Assert(libInfo !== undefined, `Lib '${scriptInfo.libName}' does not exist.`);

        this.#libBuilder.removeScript(libInfo.libFSPath, scriptInfo.scriptFSPath, 
                path.join(this.#buildFSPath, scriptInfo.libName));
    }


    /* abWeb.Ext Overrides */
    async __build(): Promise<boolean> {
        let buildPromises: Array<Promise<boolean>> = [];
        let buildJS: boolean = false;
        for (let scriptInfo of this.#scriptsToBuild) {
            if (scriptInfo.eventTypes.includes("add") || 
                    scriptInfo.eventTypes.includes("unlink")) {
                buildJS = true;
            }

            if (scriptInfo.eventTypes[scriptInfo.eventTypes.length - 1] === "unlink")
                this.#script_Remove(scriptInfo);
            else
                buildPromises.push(this.#script_Create_Async(scriptInfo));
        }
        this.#scriptsToBuild = [];

        let values = await Promise.all(buildPromises);
        for (let value of values) {
            if (!value)
                return false;
        }

        if (buildJS) {
            if (!this.builder.isType('rel'))
                this.#js.build();
            else
                this.#js.buildHeader();
        }

        return true;
    }

    __getName(): string {
        return "js-libs";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        for (let libName in changeInfos) {
            for (let changeInfo of changeInfos[libName]) {
                if (changeInfo.fsPath.indexOf(".d.ts") === 
                        changeInfo.fsPath.length - 5)
                    continue;

                let scriptToBuildFound = false;
                for (let scriptInfo of this.#scriptsToBuild) {
                    if (changeInfo.fsPath === scriptInfo.scriptFSPath) {
                        scriptToBuildFound = true;
                        for (let eventType of changeInfo.eventTypes)
                            scriptInfo.eventTypes.push(eventType);
                        break;
                    }
                }

                if (!scriptToBuildFound) {
                    this.#scriptsToBuild.push({
                        libName: libName,
                        scriptFSPath: changeInfo.fsPath,
                        eventTypes: changeInfo.eventTypes,
                    });
                }
            }
        }

        this.build();

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        this.#print_Errors = [];

        if (config.project === undefined) {
            this.#print_Errors.push(`'project' not set in config.`);
            return false;
        }
        this.#projectFSPath = path.resolve(config.project);

        if (config.path === undefined) {
            this.#print_Errors.push(`'path' not set in config.`);
            return false;
        }

        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        this.#buildFSPath = path.join(buildConfig.tmp, config.build.dev);

        let scriptPath = config.path; // path.join(buildSettings.initDir, config.path);

        if (!fs.existsSync(scriptPath)) {
            this.#print_Errors.push(
                    `'path' in config does not exist: '${config.path}'.`);
            return false;
        }

        /* Legacy */
        for (let libName in config.libs)
            this.addLib(libName, config.libs[libName], "js", null, true);

        let jsPkgs = ts0.assertType(config.jsPkgs, presets_JSPkgInfos) as JSPkgInfos;
        for (let pkgInfo of jsPkgs) {
            for (let libName in pkgInfo.libs) {
                let libFSPath = pkgInfo.libs[libName];
                this.addLib(libName, libFSPath, "js");
            }
        }
        
        let tsPkgs = ts0.assertType(config.tsPkgs, presets_TSPkgInfos) as TSPkgInfos;
        for (let pkgInfo of tsPkgs) {
            for (let libName in pkgInfo.libs) {
                let libFSPath = pkgInfo.libs[libName];
                this.addLib(libName, libFSPath, "ts", pkgInfo.tsconfig);
            }
        }

        this.#js.clearScriptsGroup('js-libs');
        // console.log('Test', this.scriptPath);
        this.#js.addScript('js-libs', scriptPath);

        this.build();

        return true;
    }

    __printErrors(printer: ExtPrinter): void {
        for (let error of this.#print_Errors)
            printer.error(error);
        for (let libName in this.#print_LibErrors) {
            for (let libError of this.#print_LibErrors[libName])
                printer.error(libError);
        }
        for (let libName in this.#print_ScriptErrors) {
            for (let fsPath in this.#print_ScriptErrors[libName]) {
                for (let scriptError of this.#print_ScriptErrors[libName][fsPath])
                    printer.error(scriptError);
            }
        }
    }

    __printLogs(printer: ExtPrinter): void {
        for (let libName in this.#print_ScriptLogs) {
            printer.log(`Lib: ${libName}`);
            let files = [];
            for (let fsPath in this.#print_ScriptLogs[libName])
                files.push(this.#print_ScriptLogs[libName][fsPath]);
            files.sort();
            for (let file of files)
                printer.log(`  - ${file}`);
        }
    }
    /* / abWeb.Ext Overrides */
}
