'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-resource-preloader': devPath + '/node_modules/ab-resource-preloader/js-lib',
    });   
}