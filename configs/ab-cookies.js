'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs']['libs'], {
        'ab-cookies': devPath + '/node_modules/ab-cookies/js-lib',
    });
}