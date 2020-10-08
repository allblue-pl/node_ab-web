'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-native': '../dev/node_modules/ab-native/js-lib',
    });
}