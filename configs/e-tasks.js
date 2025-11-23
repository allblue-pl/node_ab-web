'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'e-tasks': '../esite/packages/ecore/Tasks/js-libs/e-tasks',
    });   
}