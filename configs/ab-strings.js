'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-strings': '../dev/node_modules/ab-strings/js-lib',
    });
}