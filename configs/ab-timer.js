'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-timer': '../dev/node_modules/ab-timer/js-lib',
    });
}