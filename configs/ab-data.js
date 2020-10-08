'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-data': '../dev/node_modules/ab-data/js-lib',
    });
}