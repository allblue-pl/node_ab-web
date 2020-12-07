'use strict'

const
    js0 = require('js0')
;

class Config
{

    constructor()
    {
        this._data = {
            'copy': {
                paths: [],
            },

            'dist': {
                paths: [],
            },

            'sass': {
                paths: [],
            },
        
            'js': {
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
        this.extendArray(array, items);
    }

    extObj(object, items)
    {
        this.extendObject(object, items);
    }

    extendArray(array, items) {
        js0.args(arguments, Array, Array);

        for (let item of items) {
            if (array.includes(item))
                continue;
    
            array.push(item);
        }
    }
    
    extendObject(object, items) {
        js0.args(arguments, js0.RawObject, js0.RawObject);

        for (let key in items)
            object[key] = items[key];
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