'use strict';

module.exports.init = function(conf, data, devPath)  {
    require('./ab-strings').init(conf, data, devPath);
    require('./ab-text').init(conf, data, devPath);
    require('./js0').init(conf, data, devPath);
    require('./web-ab-api').init(conf, data, devPath);

    conf.extendObject(data['js-libs'].libs, {
        'ab-data': devPath + '/node_modules/ab-data/js-lib',
    });
}