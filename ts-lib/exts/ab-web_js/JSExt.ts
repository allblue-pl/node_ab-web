import path from "node:path";
import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import Groups from "../../Groups.ts";
import type HeaderExt from "../ab-web_header/HeaderExt.ts";
import abFS from "ab-fs";
import fs from "node:fs";
import uglifyJS from "uglify-js";
import babel from "@babel/core"
import type { ChangeInfos, ExtConfigPreset, GroupsInfos, GroupsProps } from "../../ts-types.ts";

export default class JSExt extends Ext {
    #header: HeaderExt;
    #jsPath_Tmp: string;
    #jsPath: string;
    #scriptPath_Include: string;
    #scriptPath_Map: string;
    #scriptPath_Min: string;
    #scriptPath: string;
    #scriptsGroups_Compile: Groups<string>;
    #scriptsGroups_Include: Groups<string>;

    constructor(builder: Builder) {
        super(builder);

        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        this.#header = this.uses('header') as HeaderExt;

        this.#scriptsGroups_Include = new Groups(this);
        this.addScriptsGroup('js', { values: [] }, 'include');

        this.#scriptsGroups_Compile = new Groups(this);
        this.addScriptsGroup('js', {
            after: [ 'js' ],
            values: [],
        }, 'compile');

        this.#jsPath = path.join(buildConfig.front, 'js');
        if (!abFS.existsDirSync(this.#jsPath))
            abFS.mkdirRecursiveSync(this.#jsPath);
        this.#jsPath_Tmp = path.join(buildConfig.tmp, 'js');
        if (!abFS.existsDirSync(this.#jsPath_Tmp))
            abFS.mkdirRecursiveSync(this.#jsPath_Tmp);

        this.#scriptPath_Include = path.join(buildConfig.front, 'js', 'include.min.js');
        this.#scriptPath = path.join(buildConfig.tmp, 'js', 'script.js');
        this.#scriptPath_Min = path.join(buildConfig.front, 'js', 'script.min.js');
        this.#scriptPath_Map = path.join(buildConfig.front, 'js', 'script.min.js.map');
    }

    addScript(groupId: string, scriptPath: string, type: "compile"|"include" = "compile"): void {
        let scriptsGroups = this.getScriptsGroups(type);

        if (!scriptsGroups.has(groupId))
            this.addScriptsGroup(groupId, { values: [] }, type);

        scriptsGroups.addValue(groupId, scriptPath);
        this.build();
    }

    addScript_Compile(groupId: string, scriptPath: string): void {
        this.addScript(groupId, scriptPath, 'compile');
    }

    addScript_Include(groupId: string, scriptPath: string): void {
        this.addScript(groupId, scriptPath, 'include');
    }

    addScriptsGroup(groupId: string, props: GroupsProps<string> = { values: [] }, 
            type: "compile"|"include" = "compile"): void {
        let groupId_Header = `js.${type}.${groupId}`;

        this.#header.addScriptUrisGroup_PostBody(groupId_Header, props);

        this.getScriptsGroups(type).add(groupId, props);
    }

    buildHeader() {
        this.#header.build();
    }

    clearScriptsGroup(groupId: string, type: "compile"|"include" = "compile"): void {
        let groupId_Header = `js.${type}.${groupId}`;
        this.getScriptsGroups(type).clear(groupId);
        this.#header.clearScriptUrisGroup_PostBody(groupId_Header);
        this.build();
    }

    getScriptsGroups(type: "compile"|"include"): Groups<string> {
        if (type === 'compile')
            return this.#scriptsGroups_Compile;
        else if (type === 'include')
            return this.#scriptsGroups_Include;
        
        throw new Error('Unknown script type.');
    }

    removeScript(groupId: string, scriptPath: string, 
            type: "compile"|"include" = "compile") {
        this.getScriptsGroups(type).removeValue(groupId, (value) => {
            return value === scriptPath;
        });
    }


    /* abWeb.Ext Overrides */
    __build(): boolean {
        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        this.console.info('Building...');

        let types: Array<"compile"|"include"> = [ 'include', 'compile' ];
        for (let type of types) {
            for (let groupId of this.getScriptsGroups(type).getGroupIds()) {
                let groupId_Header = `js.${type}.${groupId}`;
                this.#header.clearScriptUrisGroup_PostBody(groupId_Header);
            }
        }

        if (this.builder.isType('rel')) {
            let js = {
                include: `var ABWeb_Hash = '${buildSettings.buildHash}';\r\n`,
                compile: '',
            };
            for (let type of types) {
                this.console.log(`Type (${type}):`);

                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    this.console.info('    - ' + groupId);
                    for (let fsPath of scriptPaths) {
                        js[type] += `\r\n// File: ${fsPath}\r\n`;
                        js[type] += fs.readFileSync(fsPath) + '\r\n';
                        
                        let relPath = path.relative(buildConfig.index, fsPath)
                                .replace(/\\/g, '/');
                        this.console.log('    - ' + relPath);
                    }
                }
            }
            
            /* script.js */
            // fs.writeFileSync(this.#scriptPath + '.debug', js.include);

            let js_Include_Result = uglifyJS.minify(js.include);
            if (typeof js_Include_Result.error !== 'undefined') {
                // console.log('Test', js_Include_Result);
                this.console.error(js_Include_Result.error);
                js_Include_Result = null;
            }

            try {
                let script = babel.transform(js.compile, {
                    presets: [ 
                        [ "@babel/preset-env", {
                            useBuiltIns: 'entry',
                            corejs: 3,
                        }], 
                    ],
                    filename: 'script.js',
                    sourceMaps: true,
                    minified: true,
                });

                let modulePaths_CoreJSBundle = path.join(
                        this.builder.settings.config.dev, "node_modules", 
                        "core-js-bundle");
                // __dirname + '/../../node_modules/core-js-bundle/
                let modulePaths_RegeneratorRuntime = path.join(
                        this.builder.settings.config.dev, "node_modules", 
                        "regenerator-runtime");
                // __dirname + '/../../node_modules/regenerator-runtime

                let js_Include_Code = js_Include_Result === null ? 
                        '' : js_Include_Result.code;
                fs.writeFileSync(this.#scriptPath_Include, 
                    js_Include_Code + "\r\n" +
                    fs.readFileSync(modulePaths_CoreJSBundle + '/minified.js') + "\r\n" +
                    fs.readFileSync(modulePaths_RegeneratorRuntime + '/runtime.js') + "\r\n");


                fs.writeFileSync(this.#scriptPath, js.compile);
                fs.writeFileSync(this.#scriptPath_Min, script.code + "\r\n\r\n" +
                        "//# sourceMappingURL=./script.min.js.map");
                fs.writeFileSync(this.#scriptPath_Map, JSON.stringify(script.map));
                // +
                        // '\r\n\r\n//# sourceMappingURL=script.min.js.map');
                // fs.writeFileSync(this.#scriptPath_Map, JSON.stringify(script.map));

                if (this.#header.hasScriptUrisGroup_PostBody('js.min'))
                    this.#header.clearScriptUrisGroup_PostBody('js.min');
                else
                    this.#header.addScriptUrisGroup_PostBody('js.min');

                // this.#header.addTag_PostBody('js.min', 'script', {
                //     src: this.uri(this.#scriptPath_Include),
                //     // type: 'text/javascript',
                // }, '');
                this.#header.addScriptUri_PostBody('js.min',
                        this.uri(this.#scriptPath_Include));

                // this.#header.addTag_PostBody('js.min', 'script', {
                //     src: this.uri(this.#scriptPath_Min),
                //     // type: 'text/javascript',
                // }, '');
                this.#header.addScriptUri_PostBody('js.min',
                        this.uri(this.#scriptPath_Min));

                this.#header.build();

                this.console.success('Finished.');
            } catch (err) {
                // this.#header.addTag_Body('js.min', 'script', {
                //     src: this.uri(this.#scriptPath_Include),
                //     // type: 'text/javascript',
                // }, '');


                // this.#header.addTag_Body('js.min', 'script', {
                //     src: this.uri(this.#scriptPath_Min),
                //     // type: 'text/javascript',
                // }, '');

                this.console.error((err as Error).stack as string);
            }
        } else {
            this.console.log('Scripts:');
            for (let type of types) {
                this.console.log(`Type (${type}):`)

                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    this.console.info('    - ' + groupId);
                    for (let fsPath of scriptPaths) {
                        let relPath = null;
                        try {
                            relPath = path.relative(buildConfig.index, fsPath)
                                    .replace(/\\/g, '/');
                        } catch (e) {
                            this.console.error((e as Error).toString());
                            continue;
                        }

                        let uri = buildConfig.base + relPath + '?v=' +
                                buildSettings.buildHash;

                        // this.#header.addTag_PostBody(groupId, 'script', {
                        //     src: uri,
                        //     // type: 'text/javascript',
                        // }, '');
                        let groupId_Header = `js.${type}.${groupId}`;
                        this.#header.addScriptUri_PostBody(groupId_Header, uri);
            
                        this.console.log('    - ' + relPath);
                    }
                }
            }

            this.#header.build();
            this.console.success('Finished.');
        }

        return true;
    }

    __getName(): string {
        return "js";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        if (this.builder.isType('dev')) {
            let types: Array<"compile"|"include"> = [ 'include', 'compile' ];
            let build = false;
            for (let type of types) {
                if (!(type in changeInfos))
                    continue;

                for (let changeInfo of changeInfos[type]) {
                    if (changeInfo.eventType === "add") {
                        this.addScript('js', changeInfo.fsPath, type);
                        build = true;
                    }
                    else if (changeInfo.eventType === "unlink") {
                        this.removeScript('js', changeInfo.fsPath, type);
                        build = true;
                    }
                }
            }

            if (build)
                this.build();
        } else {
            let types: Array<"compile"|"include"> = [ 'include', 'compile' ];
            for (let type of types) {
                if (!(type in changeInfos))
                    continue;

                this.clearScriptsGroup('js', type);
                let watchedFSPaths = this.getWatchedFSPaths();
                for (let scriptPath of watchedFSPaths[type])
                    this.addScript('js', scriptPath, type);
            }

            this.build();
        }

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        // abWeb.types.conf(config, {
        //     'paths':  {
        //         required: false,
        //         type: 'array',
        //     },
        // });

        if ('include' in config) {
            let fsPaths = [];
            for (let fsPath of config.include)
                fsPaths.push(path.resolve(fsPath));

            if (this.builder.isType('dev'))
                this.watch('include', [ 'add', 'unlink' ], fsPaths);
            else if (this.builder.isType('rel'))
                this.watch('include', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        if ('compile' in config) {
            let fsPaths = [];
            for (let fsPath of config.compile)
                fsPaths.push(path.resolve(fsPath));

            if (this.builder.isType('dev'))
                this.watch('compile', [ 'add', 'unlink' ], fsPaths);
            else if (this.builder.isType('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        if ('paths' in config) {
            let fsPaths = [];
            for (let fsPath of config.paths)
                fsPaths.push(path.resolve(fsPath));

            if (this.builder.isType('dev'))
                this.watch('compile', [ 'add', 'unlink' ], fsPaths);
            else if (this.builder.isType('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], fsPaths);
        }

        return true;
    }
    /* / abWeb.Ext Overrides */

}
