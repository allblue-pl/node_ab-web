'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'e-libs': '../esite/packages/ecore/ELibs/js-libs/e-libs',
    });   
}