'use strict';

module.exports.init = function(conf, data)  {
    conf.extendObject(data['js-libs'].libs, {
        'web-ab-api': '../dev/node_modules/web-ab-api/js-lib',
    });
}