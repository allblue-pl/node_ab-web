'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-timer': devPath + '/node_modules/ab-timer/js-lib',
    });
}