'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-time': devPath + '/node_modules/ab-time/js-lib',
    });
}