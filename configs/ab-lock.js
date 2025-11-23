'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-lock': devPath + '/node_modules/ab-lock/js-lib',
    });
}