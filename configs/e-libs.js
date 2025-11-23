'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'e-libs': '../esite/packages/ecore/ELibs/js-libs/e-libs',
    });   
}