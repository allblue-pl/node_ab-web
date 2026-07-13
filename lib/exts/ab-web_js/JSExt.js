import anymatch from "anymatch";
import path from "node:path";
                                            
import Ext, { ExtPrinter } from "../../Ext.js";
import Groups from "../../Groups.js";
                                                           
import abFS, { abFSMatcher } from "ab-fs";
import fs from "node:fs";
import uglifyJS from "uglify-js";
import babel from "@babel/core"
;                                                                                               

export default class JSExt extends Ext {
    #header           ;
    #jsPath_Tmp        ;
    #jsPath        ;
    #scriptPath_Include        ;
    #scriptPath_Map        ;
    #scriptPath_Min        ;
    #scriptPath        ;
    #scriptsGroups_Compile                ;
    #scriptsGroups_Include                ;
    #watchedFSPaths                                                      ;

    #print_Errors                             ;

    constructor(builder         ) {
        super(builder);

        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        this.#header = this.uses('header')             ;

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

        this.#watchedFSPaths = {
            "include": [],
            "compile": [],
        };

        this.#print_Errors = {};
    }

    addScript(groupId        , scriptPath        , type                      = "compile")       {
        let scriptsGroups = this.getScriptsGroups(type);

        if (!scriptsGroups.has(groupId))
            this.addScriptsGroup(groupId, { values: [] }, type);

        scriptsGroups.addValue(groupId, scriptPath);
        this.build();
    }

    addScript_Compile(groupId        , scriptPath        )       {
        this.addScript(groupId, scriptPath, 'compile');
    }

    addScript_Include(groupId        , scriptPath        )       {
        this.addScript(groupId, scriptPath, 'include');
    }

    addScriptsGroup(groupId        , props                      = { values: [] }, 
            type                      = "compile")       {
        let groupId_Header = `js.${type}.${groupId}`;

        this.#header.addScriptUrisGroup_PostBody(groupId_Header, props);

        this.getScriptsGroups(type).add(groupId, props);
    }

    buildHeader()       {
        this.#header.build();
    }

    clearScriptsGroup(groupId        , type                      = "compile")       {
        let groupId_Header = `js.${type}.${groupId}`;
        this.getScriptsGroups(type).clear(groupId);
        this.#header.clearScriptUrisGroup_PostBody(groupId_Header);
        this.build();
    }

    getScriptsGroups(type                     )                 {
        if (type === 'compile')
            return this.#scriptsGroups_Compile;
        else if (type === 'include')
            return this.#scriptsGroups_Include;
        
        throw new Error('Unknown script type.');
    }

    removeScript(groupId        , scriptPath        , 
            type                      = "compile")       {
        this.getScriptsGroups(type).removeValue(groupId, (value) => {
            return value === scriptPath;
        });
    }


    #sortScriptPaths(fsPaths               , watchedFSPaths               )  
                          {
        let fsPaths_Helper                                         = [];
        for (let fsPath of fsPaths) {
            let matched = false;
            for (let i = 0; i < watchedFSPaths.length; i++) {
                if (anymatch([ watchedFSPaths[i].replaceAll("\\", "/") ], 
                        fsPath.replaceAll("\\", "/"))) {
                    fsPaths_Helper.push({
                        order: i,
                        fsPath: fsPath,
                    });
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // this.console.warn(`FS Path '${fsPath}' not matched.`);
                fsPaths_Helper.push({
                    order: Number.MAX_SAFE_INTEGER,
                    fsPath: fsPath,
                });
            }
        }

        fsPaths_Helper = fsPaths_Helper.sort((a, b) => {
            if (a.order === b.order)
                return a.fsPath.localeCompare(b.fsPath);

            return a.order - b.order;
        });

        let fsPaths_Sorted                = [];
        for (let fsPathInfo of fsPaths_Helper)
            fsPaths_Sorted.push(fsPathInfo.fsPath);

        return fsPaths_Sorted;
    }


    /* abWeb.Ext Overrides */
    __build()          {
        this.#print_Errors = {};

        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        let types                             = [ 'include', 'compile' ];
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
                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    for (let fsPath of scriptPaths) {
                        let relPath = path.relative(path.resolve("."), fsPath);
                        js[type] += `\r\n// File: ${relPath}\r\n`;
                        js[type] += fs.readFileSync(fsPath) + '\r\n';
                    }
                }
            }
            
            /* script.js */
            // fs.writeFileSync(this.#scriptPath + '.debug', js.include);

            let js_Include_Result = uglifyJS.minify(js.include);
            if (typeof js_Include_Result.error !== 'undefined') {
                this.#print_Errors.rel = js_Include_Result.error;
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

                let modulePaths_CoreJSBundle = path.resolve(path.join(
                        "node_modules", "core-js-bundle"));

                let modulePaths_RegeneratorRuntime = path.resolve(path.join(
                        "node_modules", "regenerator-runtime"));

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

                if (this.#header.hasScriptUrisGroup_PostBody('js.min'))
                    this.#header.clearScriptUrisGroup_PostBody('js.min');
                else
                    this.#header.addScriptUrisGroup_PostBody('js.min');

                this.#header.addScriptUri_PostBody('js.min',
                        this.uri(this.#scriptPath_Include));

                this.#header.addScriptUri_PostBody('js.min',
                        this.uri(this.#scriptPath_Min));

                this.#header.build();
            } catch (err) {
                this.#print_Errors.rel = (err         ).stack          ;
            }
        } else {
            for (let type of types) {
                let scriptGroups = this.getScriptsGroups(type).getValues();
                for (let [ groupId, scriptPaths ] of scriptGroups) {
                    scriptPaths = this.#sortScriptPaths(scriptPaths, 
                            this.#watchedFSPaths[type]);
                    for (let fsPath of scriptPaths) {
                        let relPath = null;
                        try {
                            relPath = path.relative(buildConfig.index, fsPath)
                                    .replace(/\\/g, '/');
                        } catch (e) {
                            this.#print_Errors[fsPath] = (e         ).toString();
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
                    }
                }
            }

            this.#header.build();
        }

        return true;
    }

    __getName()         {
        return "js";
    }

    __onChange(changeInfos             )          {
        if (this.builder.isType('dev')) {
            let types                             = [ 'include', 'compile' ];
            let build = false;
            for (let type of types) {
                if (!(type in changeInfos))
                    continue;

                for (let changeInfo of changeInfos[type]) {
                    for (let i = changeInfo.eventTypes.length - 1; i >= 0; i--) {
                        if (changeInfo.eventTypes.includes("unlink")) {
                            this.removeScript('js', changeInfo.fsPath, type);
                            build = true;
                            break;
                        } else if (changeInfo.eventTypes.includes("add")) {
                            this.addScript('js', changeInfo.fsPath, type);
                            build = true;
                            break;
                        }
                    }
                }
            }

            if (build)
                this.build();
        } else {
            let types                             = [ 'include', 'compile' ];
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

    __parse(config                 )          {
        // abWeb.types.conf(config, {
        //     'paths':  {
        //         required: false,
        //         type: 'array',
        //     },
        // });

        if ('include' in config) {
            let watchFSPaths = [];
            for (let watchFSPath of config.include)
                watchFSPaths.push(path.resolve(watchFSPath));

            if (this.builder.isType('dev'))
                this.watch('include', [ 'add', 'unlink' ], watchFSPaths);
            else if (this.builder.isType('rel'))
                this.watch('include', [ 'add', 'unlink', 'change' ], watchFSPaths);
            
            this.#watchedFSPaths["include"] = watchFSPaths;
        }

        if ('compile' in config) {
            let watchFSPaths = [];
            for (let watchFSPath of config.compile)
                watchFSPaths.push(path.resolve(watchFSPath));

            if (this.builder.isType('dev'))
                this.watch('compile', [ 'add', 'unlink' ], watchFSPaths);
            else if (this.builder.isType('rel'))
                this.watch('compile', [ 'add', 'unlink', 'change' ], watchFSPaths);

            this.#watchedFSPaths["compile"] = watchFSPaths;
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

    __printErrors(printer            )       {
        for (let fsPath in this.#print_Errors)
            printer.error(this.#print_Errors[fsPath]);
    }

    __printLogs(printer            )       {
        let buildSettings = this.builder.settings;
        let buildConfig = buildSettings.config;

        let types                             = [ 'include', 'compile' ];

        printer.log('Scripts:');
        for (let type of types) {
            printer.log(`Type (${type}):`)

            let scriptGroups = this.getScriptsGroups(type).getValues();
            for (let [ groupId, scriptPaths ] of scriptGroups) {
                printer.info('  - ' + groupId);
                for (let fsPath of scriptPaths) {
                    let relPath = path.relative(buildConfig.index, fsPath)
                        .replace(/\\/g, '/');
                    printer.log('    - ' + relPath);
                }
            }
        }
    }

}
