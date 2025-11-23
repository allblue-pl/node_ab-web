'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-text': devPath + '/node_modules/ab-text/js-lib',
    });
}