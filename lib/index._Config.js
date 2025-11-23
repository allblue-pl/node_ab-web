'use strict';

const abWeb = require('./index');


Object.defineProperties(abWeb, {

    _Config: { value:
    class abWeb_Config {

        constructor() {
            this._config = {};
            this._configPath = null;
        }

        parse(config_object, configPath) {
            this._config = config_object;
        }

        setConfigPath(configPath) {
            this._configPath = configPath;
        }

    }},

});
module.exports = abWeb._Config;
