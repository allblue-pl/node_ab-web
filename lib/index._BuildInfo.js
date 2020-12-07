'use strict';

const abWeb = require('./index');

const path = require('path');


Object.defineProperty(abWeb, '_BuildInfo', { value:
class abWeb_BuildInfo
{

    constructor(config, buildType = 'dev')
    {
        let types = new Set();
        // for (let i = processArgvOffset + 2; i < processArgv.length; i++)
        //     types.add(processArgv[i]);

        // if (!types.has('dev') && !types.has('rel'))
        //     types.add('dev');

        types.add(buildType);

        Object.defineProperties(this, {
            front: { value: path.resolve(config.front), },
            back: { value: path.resolve(config.back), },
            index: { value: path.resolve(config.index), },
            base: { value: config.base, },

            hash: { value: this._generateHash(), },

            _types: { value: types, },
        });
    }

    type(build_type)
    {
        return this._types.has(build_type);
    }


    _generateHash()
    {
        let hash = '';

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                'abcdefghijklmnopqrstuvwxyz' + '0123456789';

        for (var i = 0; i < 10; i++)
            hash += chars.charAt(Math.floor(Math.random() * chars.length));

        return hash;
    }

}});
module.exports = abWeb._BuildInfo;
