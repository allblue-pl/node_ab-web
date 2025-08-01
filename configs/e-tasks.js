'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'e-tasks': '../esite/packages/ecore/Tasks/js-libs/e-tasks',
    });   
}