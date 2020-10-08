'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs']['libs'], {
        'ab-cookies': '../dev/node_modules/ab-cookies/js-lib',
    });
}