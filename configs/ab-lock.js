'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-lock': '../dev/node_modules/ab-lock/js-lib',
    });
}