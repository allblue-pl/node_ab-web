'use strict';

module.exports.init = function(conf, data, devPath) {
    require('./ab-lock').init(conf, data, devPath);
    require('./js0').init(conf, data, devPath);

    conf.extendObject(data['js-libs'].libs, {
        'ab-database-native': devPath + '/node_modules/ab-database-native/js-lib',
    });
}