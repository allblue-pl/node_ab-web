'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.init('moment');

    conf.extendObject(data['js-libs'].libs, {
        'ab-date': devPath + '/node_modules/ab-date/js-lib',
    });
    conf.extendObject(data['js-libs'].libs, {
        'moment': devPath + '/node_modules/ab-date/moment/js-lib',
    });
    conf.extendObject(data['js-libs'].libs, {
        'moment-timezone': devPath + '/node_modules/ab-date/moment-timezone/js-lib',
    });
}