import Ext, { ExtPrinter } from "../../Ext.ts";
import HeaderExt from "../ab-web_header/HeaderExt.ts";
import JSLibsExt from "../ab-web_js-libs/JSLibsExt.ts";
import type Builder from "../../Builder.ts";
import path from "node:path";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
import abFS from "ab-fs";
import fs from "node:fs";
import LayoutParser from "./LayoutParser.ts";
import { presets_JSPkgInfos, presets_TSPkgInfos, type JSPkgInfos, type TSPkgInfos } from "../ab-web_js-libs/ts-types.ts";
import ts0 from "@allblue/ts0";

export default class SpockyExt extends Ext {
    #jsLibs: JSLibsExt;

    #modulePath = null;

    #indexes_ToBuild: {[libName:string]: boolean};
    #layoutOverrides: {[layoutPath:string]: string};
    #layoutPaths_ToBuild: {[libName:string]: Array<string>};
    #libInfos: {[libName:string]: {fsPath: string, layoutsFSPath: string}};

    #print_Errors: Array<string>;

    constructor(builder: Builder) { 
        super(builder);

        this.#jsLibs = this.uses('js-libs') as JSLibsExt;

        this.#modulePath = null;

        this.#indexes_ToBuild = {};

        this.#layoutOverrides = {};
        this.#layoutPaths_ToBuild = {};
        this.#libInfos = {};

        this.#print_Errors = [];
    }


    #buildIndex(libName: string): void {
        let libInfo = this.#libInfos[libName];
        let jsLibInfo = this.#jsLibs.getLibInfo(libName);

        this.#indexes_ToBuild[libName] = false;

        let layoutPaths = this.getWatchedFSPaths()[`layouts.${libName}`];

        let content = `import { Layout } from "spocky";\r\n`;

        // if (jsLibInfo.type === "ts")
        //     content += `import Layout from "spocky";`;
        
        for (let layoutPath of layoutPaths) {
            let layoutName = path.basename(layoutPath, '.html');
        
            content += `import ${layoutName} from "./${layoutName}.${jsLibInfo.type}";\r\n`;
        }

        content += `\r\nexport class $layouts_Class {\r\n`;

        for (let layoutPath of layoutPaths) {
            let layoutName = path.basename(layoutPath, '.html');
            let returnType = jsLibInfo.type === "ts" ? `: typeof ${layoutName}` : "";

            content += `    get ${layoutName}()${returnType} {\r\n`;
            content += `        return ${layoutName};\r\n`;
            content += `    }\r\n\r\n`;
        }

        content += `\r\n    constructor() {\r\n\r\n    }\r\n\r\n`;
        
        content +=  `   getContent(layoutName` + (jsLibInfo.type === "ts" ? `: string` : "") + 
                `)` + (jsLibInfo.type === "ts" ? `: Array<any>` : "") + ` {\r\n`;
        for (let layoutPath of layoutPaths) {
            let layoutName = path.basename(layoutPath, '.html');

            content += `        if (layoutName === "${layoutName}")\r\n`;
            content += `            return ${layoutName}.Content;\r\n`;
        }

        content += `\r\n        throw new Error("Layout '\${layoutName}' does not exist.");\r\n`;
        content += `    }\r\n`

        content += `}\r\n`;
        content += `const $layouts = new $layouts_Class();\r\n`;
        content += `export default $layouts`;

        fs.writeFileSync(path.join(libInfo.layoutsFSPath, "index") + 
                `.${jsLibInfo.type}`, content);

        // let indexRelPath = path.relative(this.builder.settings.config.index, 
        //         path.join(indexDirPath, 'index.js')).replace('/\\/g', '/');
    }


    /* abWeb.Ext Overrides */
    __build(): boolean {
        this.#print_Errors = [];

        for (let libName in this.#layoutPaths_ToBuild) {
            for (let layoutPath of this.#layoutPaths_ToBuild[libName]) {
                try {
                    let layoutContent = LayoutParser.Parse(layoutPath);
                    let jsLibInfo = this.#jsLibs.getLibInfo(libName);
                    let buildFSPath = path.join(this.#libInfos[libName].layoutsFSPath, 
                            path.basename(layoutPath, '.html') + `.${jsLibInfo.type}`);
                    fs.writeFileSync(buildFSPath, layoutContent);
                } catch (err) {
                    this.#print_Errors.push(`Cannot parse '${layoutPath}':`);
                    this.#print_Errors.push((err as Error).stack as string);
                    return false;
                }

                // let relLayoutPath = path.relative(this.builder.settings.config.index, 
                //         layoutPath).replace(/\\/g, '/');
                this.#layoutPaths_ToBuild[libName] = [];
            }
        }

        for (let libName in this.#layoutPaths_ToBuild) {
            if (this.#indexes_ToBuild[libName])
                this.#buildIndex(libName);
        }

        return true;
    }

    __getName(): string {
        return "spocky";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        for (let watchedName in changeInfos) {
            if (watchedName.startsWith("layouts.")) {
                let libName = watchedName.substring("layouts.".length);
                for (let changeInfo of changeInfos[watchedName]) {
                    let index = this.#layoutPaths_ToBuild[libName].indexOf(
                            changeInfo.fsPath);

                    if (changeInfo.eventTypes[changeInfo.eventTypes.length - 1] === 
                            "unlink") {
                        if (index !== -1)
                            this.#layoutPaths_ToBuild[libName].splice(index, 1);

                        continue;
                    }

                    if (index === -1) {
                        this.#layoutPaths_ToBuild[libName].push(changeInfo.fsPath);
                        if (changeInfo.eventTypes.includes("add")) {
                            let fsPath_Parsed = path.parse(changeInfo.fsPath);

                            this.#indexes_ToBuild[libName] = true;
                        }
                    }
                }
            }
        }

        this.build();

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        this.#print_Errors = [];

        if (!('path' in config)) {
            this.#print_Errors.push('Spockies module path not set.');
            return false;
        }

        this.#modulePath = config.path;

        for (let libFSPath of config.packages) {
            let libName = path.basename(libFSPath);

            let layoutsPath = path.join(libFSPath, 'js-lib/$layouts');
            if (fs.existsSync(layoutsPath))
                abFS.removeSync(layoutsPath);
            fs.mkdirSync(layoutsPath);

            this.#libInfos[libName] = {
                fsPath: path.join(libFSPath, "js-lib"),
                layoutsFSPath: layoutsPath,
            };
            this.#jsLibs.addLib(libName, path.join(libFSPath, "js-lib"), "js", 
                    null, true);
            this.#layoutPaths_ToBuild[libName] = [];
            this.#indexes_ToBuild[libName] = false;

            this.watch(`layouts.${libName}`, [ "add", "change", "unlink" ], [
                path.join(libFSPath, "layouts/**/*.html"),
            ]);
        }

        let jsPkgs = ts0.assertType(config.jsPkgs, presets_JSPkgInfos) as JSPkgInfos;
        for (let pkgInfo of jsPkgs) {
            for (let libName in pkgInfo.libs) {
                let libFSPath = pkgInfo.libs[libName];

                let layoutsPath = path.join(libFSPath, '$layouts');
                if (fs.existsSync(layoutsPath))
                    abFS.removeSync(layoutsPath);
                fs.mkdirSync(layoutsPath);

                this.#libInfos[libName] = {
                    fsPath: libFSPath,
                    layoutsFSPath: layoutsPath,
                };

                this.#jsLibs.addLib(libName, libFSPath, "js");
                this.#layoutPaths_ToBuild[libName] = [];
                this.#indexes_ToBuild[libName] = false;

                this.watch(`layouts.${libName}`, [ "add", "change", "unlink" ], [
                    path.join(libFSPath, "layouts/**/*.html"),
                ]);
            }
        }

        let tsPkgs = ts0.assertType(config.tsPkgs, presets_TSPkgInfos) as TSPkgInfos;
        for (let pkgInfo of tsPkgs) {
            for (let libName in pkgInfo.libs) {
                let libFSPath = pkgInfo.libs[libName];

                let layoutsPath = path.join(libFSPath, '$layouts');
                if (fs.existsSync(layoutsPath))
                    abFS.removeSync(layoutsPath);
                fs.mkdirSync(layoutsPath);

                this.#libInfos[libName] = {
                    fsPath: libFSPath,
                    layoutsFSPath: layoutsPath,
                };

                this.#jsLibs.addLib(libName, libFSPath, "ts", pkgInfo.tsconfig);
                this.#layoutPaths_ToBuild[libName] = [];
                this.#indexes_ToBuild[libName] = false;

                this.watch(`layouts.${libName}`, [ "add", "change", "unlink" ], [
                    path.join(libFSPath, "layouts/**/*.html"),
                ]);
            }
        }

        return true;
    }

    __printErrors(printer: ExtPrinter): void {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */
}