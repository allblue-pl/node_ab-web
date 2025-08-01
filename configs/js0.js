'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'js0': '../dev/node_modules/js0/js-lib',
    });
}