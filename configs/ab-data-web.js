'use strict';

module.exports.init = function(conf, data, devPath)  {
    require('./js0').init(conf, data, devPath);
    require('./web-ab-api').init(conf, data, devPath);

    conf.extendObject(data['js-libs'].libs, {
        'ab-data-web': devPath + '/node_modules/ab-data-web/js-lib',
    });
}