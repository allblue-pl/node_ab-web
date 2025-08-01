'use strict'

const
    js0 = require('js0')
;

class Config {

    get buildInfo() {
        return this._buildInfo;
    }


    constructor(buildInfo)
    {
        this._buildInfo = buildInfo;

        this._data = {
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
                path: '../dev/node_modules/js-libs-web/js/js-libs.js',
                build: {
                    dev: 'js-libs',
                    rel: 'js-libs/js-libs.min.js'
                },
                libs: {},
            },

            'spocky': {
                path: '../dev/node_modules/spocky',
                packages: [],
            },
        };
    }

    ext(extFn)
    {
        extFn(this, this._data);

        return this;
    }

    extArr(array, items)
    {
        return this.extendArray(array, items);
    }

    extObj(object, items)
    {
        return this.extendObject(object, items);
    }

    extendArray(array, items) {
        js0.args(arguments, Array, Array);

        for (let item of items) {
            if (array.includes(item))
                continue;
    
            array.push(item);
        }

        return this;
    }
    
    extendObject(object, items) {
        js0.args(arguments, js0.RawObject, js0.RawObject);

        for (let key in items)
            object[key] = items[key];

        return this;
    }

    getData()
    {
        return this._data;
    }

    init(name)
    {
        require(`../configs/${name}`).init(this, this._data);

        return this;
    }

}
module.exports = Config;