'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'js0': devPath + '/node_modules/js0/js-lib',
    });
}