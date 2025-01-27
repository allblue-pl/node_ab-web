'use strict';

module.exports.init = function(conf, data) 
{
    conf.extArr(data['js']['include'], [
        '../dev/node_modules/moment/min/moment-with-locales.js',
        '../dev/node_modules/moment-timezone/builds/moment-timezone-with-data-1970-2030.min.js',

    ]);
}