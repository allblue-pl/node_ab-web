'use strict';

module.exports.init = function(conf, data, devPath)  {
    require('./js0').init(conf, data, devPath);

    conf.extendObject(data['js-libs'].libs, {
        'ab-native': devPath + '/node_modules/ab-native/js-lib',
    });
}