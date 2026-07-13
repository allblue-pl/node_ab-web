import ts0 from "@allblue/ts0";
import type BuildSettings from "./BuildSettings.ts";
import type { InitFn } from "./ts-types.ts";

export default class BuildData {
    #initFns: Array<InitFn>;
    #data: object;
    #settings: BuildSettings;


    get settings(): BuildSettings {
        return this.#settings;
    }

    get data(): {[key:string]: any} {
        return this.#data;
    }

    get devFSPath(): string {
        return this.#settings.config.dev;
    }

    get initFSPath(): string {
        return this.#settings.initDir;
    }


    constructor(build: BuildSettings) {
        this.#initFns = [];
        this.#settings = build;

        this.#data = {
            'copy': {
                paths: [],
            },

            'dist': {
                paths: [],
            },

            'header': {
                exportHash: [ 'js' ],
            },

            'replace-header': {
                files: [],
            },

            'sass': {
                addToHeader: true,
                remaps: [],
                paths: [],
                variants: {},
                substyles: {},
            },
        
            'js': {
                oneFile: true,
                include: [],
                compile: [],
            },
        
            'js-libs': {
                project: "../.",
                path: this.devFSPath + '/node_modules/js-libs-web/js/js-libs.js',
                build: {
                    dev: 'js-libs',
                    rel: 'js-libs/js-libs.min.js'
                },
                libs: {},
                jsPkgs: [],
                tsPkgs: [],
            },

            'spocky': {
                path: this.devFSPath + '/node_modules/spocky',
                packages: [],
                jsPkgs: [],
                tsPkgs: [],
            },

            'ts-validator': {
                tsconfig: this.devFSPath,
            },
        };
    }

    ext(extFn: (buildSettings: BuildSettings, data: object, devPath: string) => 
            void): BuildData {
        extFn(this.#settings, this.#data, this.devFSPath);

        return this;
    }

    extArr(array: Array<any>, items: Array<any>): BuildData {
        return this.extendArray(array, items);
    }

    extObj(object: object, items: object): BuildData {
        return this.extendObject(object, items);
    }

    extendArray(array: Array<any>, items: Array<any>): BuildData {
        ts0.assertType(array, Array);
        ts0.assertType(items, Array);

        for (let item of items) {
            if (array.includes(item))
                continue;
    
            array.push(item);
        }

        return this;
    }
    
    extendObject(object: {[key:string]: any}, items: {[key:string]: any}): BuildData {
        ts0.assertType(object, ts0.TRawObject);
        ts0.assertType(items, ts0.TRawObject);

        for (let key in items)
            object[key] = items[key];

        return this;
    }

    getData(): object {
        return this.#data;
    }

    init(initFn: InitFn): BuildData {
        if (this.#initFns.includes(initFn))
            return this;
            
        this.#initFns.push(initFn);

        return initFn(this);
    }

}