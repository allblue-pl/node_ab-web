'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-text-parser': '../dev/node_modules/ab-text-parser/js-lib',
    });
}