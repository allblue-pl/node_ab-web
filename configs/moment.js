'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['js']['include'], [
        devPath + '/node_modules/moment/min/moment-with-locales.js',
        devPath + '/node_modules/moment-timezone/builds/moment-timezone-with-data-1970-2030.min.js',
    ]);
}