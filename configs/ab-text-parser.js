'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-text-parser': devPath + '/node_modules/ab-text-parser/js-lib',
    });
}