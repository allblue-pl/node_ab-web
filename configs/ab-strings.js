'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-strings': devPath + '/node_modules/ab-strings/js-lib',
    });
}