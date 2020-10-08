'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-text': '../dev/node_modules/ab-text/js-lib',
    });
}