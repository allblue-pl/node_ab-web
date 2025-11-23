'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-layouts': devPath + '/node_modules/ab-layouts/js-lib',
    });
}