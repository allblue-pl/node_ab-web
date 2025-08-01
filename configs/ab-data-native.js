'use strict';

module.exports.init = function(conf, data)  {
    require('./ab-database-native').init(conf, data);
    require('./js0').init(conf, data);
    require('./web-ab-api').init(conf, data);

    conf.extendObject(data['js-libs'].libs, {
        'ab-data-native': '../dev/node_modules/ab-data-native/js-lib',
    });
}