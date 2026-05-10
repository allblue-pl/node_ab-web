export default class BuildData {
    #settings;
    #data;
    get settings() {
        return this.#settings;
    }
    get data() {
        return this.#data;
    }
    get devFSPath() {
        return this.#settings.config.dev;
    }
    constructor(build) {
        this.#settings = build;
        this.#data = {
            'copy': {
                paths: [],
            },
            'dist': {
                paths: [],
            },
            'header': {
                exportHash: ['js'],
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
    ext(extFn) {
        extFn(this.#settings, this.#data, this.devFSPath);
        return this;
    }
    extArr(array, items) {
        return this.extendArray(array, items);
    }
    extObj(object, items) {
        return this.extendObject(object, items);
    }
    extendArray(array, items) {
        for (let item of items) {
            if (array.includes(item))
                continue;
            array.push(item);
        }
        return this;
    }
    extendObject(object, items) {
        for (let key in items)
            object[key] = items[key];
        return this;
    }
    getData() {
        return this.#data;
    }
    init(initFn) {
        return initFn(this);
    }
}
