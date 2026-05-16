import type BuildSettings from "./BuildSettings.ts";
import type { InitFn } from "./ts-types.ts";

export default class BuildData {
    #settings: BuildSettings;
    #data: object;


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
                path: this.devFSPath + '/node_modules/js-libs-web/js/js-libs.js',
                build: {
                    dev: 'js-libs',
                    rel: 'js-libs/js-libs.min.js'
                },
                libs: {},
            },

            'spocky': {
                path: this.devFSPath + '/node_modules/spocky',
                packages: [],
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

    extObj(object: object, items: object) {
        return this.extendObject(object, items);
    }

    extendArray(array: Array<any>, items: Array<any>): BuildData {
        for (let item of items) {
            if (array.includes(item))
                continue;
    
            array.push(item);
        }

        return this;
    }
    
    extendObject(object: {[key:string]: any}, items: {[key:string]: any}): BuildData {
        for (let key in items)
            object[key] = items[key];

        return this;
    }

    getData() {
        return this.#data;
    }

    init(initFn: InitFn) {
        return initFn(this);
    }

}