'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-fields': '../dev/node_modules/ab-fields/js-lib',
    });
}