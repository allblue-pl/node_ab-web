'use strict';

const abWeb = require('./index');


Object.defineProperties(abWeb, {

    _Config: { value:
    class abWeb_Config {

        constructor()
        {
            this._config = {};
        }

        parse(config_object)
        {
            this._config = config_object;
        }

    }},

});
module.exports = abWeb._Config;
