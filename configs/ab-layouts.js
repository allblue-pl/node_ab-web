'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-layouts': '../dev/node_modules/ab-layouts/js-lib',
    });
}