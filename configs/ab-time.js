'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-time': '../dev/node_modules/ab-time/js-lib',
    });
}