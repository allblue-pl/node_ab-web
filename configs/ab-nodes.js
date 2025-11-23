'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-nodes': devPath + '/node_modules/ab-nodes/js-lib',
    });
}