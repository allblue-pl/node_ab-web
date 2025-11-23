'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'web-ab-api': devPath + '/node_modules/web-ab-api/js-lib',
    });
}