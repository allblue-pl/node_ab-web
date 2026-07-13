import ts0 from "@allblue/ts0";
                                                    
                                            

export default class BuildData {
    #initFns               ;
    #data        ;
    #settings               ;


    get settings()                {
        return this.#settings;
    }

    get data()                      {
        return this.#data;
    }

    get devFSPath()         {
        return this.#settings.config.dev;
    }

    get initFSPath()         {
        return this.#settings.initDir;
    }


    constructor(build               ) {
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

    ext(extFn                                                                   
                )            {
        extFn(this.#settings, this.#data, this.devFSPath);

        return this;
    }

    extArr(array            , items            )            {
        return this.extendArray(array, items);
    }

    extObj(object        , items        )            {
        return this.extendObject(object, items);
    }

    extendArray(array            , items            )            {
        ts0.assertType(array, Array);
        ts0.assertType(items, Array);

        for (let item of items) {
            if (array.includes(item))
                continue;
    
            array.push(item);
        }

        return this;
    }
    
    extendObject(object                     , items                     )            {
        ts0.assertType(object, ts0.TRawObject);
        ts0.assertType(items, ts0.TRawObject);

        for (let key in items)
            object[key] = items[key];

        return this;
    }

    getData()         {
        return this.#data;
    }

    init(initFn        )            {
        if (this.#initFns.includes(initFn))
            return this;
            
        this.#initFns.push(initFn);

        return initFn(this);
    }

}