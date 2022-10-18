'use strict';

module.exports.init = function(conf, data) 
{
    require('./ab-lock').init(conf, data);
    require('./ab-strings').init(conf, data);
    require('./ab-text').init(conf, data);
    require('./js0').init(conf, data);
    require('./web-ab-api').init(conf, data);

    conf.extendObject(data['js-libs'].libs, {
        'ab-data': '../dev/node_modules/ab-data/js-lib',
    });
}