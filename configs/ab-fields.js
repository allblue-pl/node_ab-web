'use strict';

module.exports.init = function(conf, data, devPath) {
    conf.extendObject(data['js-libs'].libs, {
        'ab-fields': devPath + '/node_modules/ab-fields/js-lib',
    });
}