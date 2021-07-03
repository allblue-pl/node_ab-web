'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-resource-preloader': '../dev/node_modules/ab-resource-preloader/js-lib',
    });   
}