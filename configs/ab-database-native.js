'use strict';

module.exports.init = function(conf, data) {
    require('./js0').init(conf, data);

    conf.extendObject(data['js-libs'].libs, {
        'ab-database-native': '../dev/node_modules/ab-database-native/js-lib',
    });
}