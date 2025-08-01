'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-nodes': '../dev/node_modules/ab-nodes/js-lib',
    });
}