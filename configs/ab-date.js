'use strict';

module.exports.init = function(conf, data) 
{
    conf.init('moment');

    conf.extendObject(data['js-libs'].libs, {
        'ab-date': '../dev/node_modules/ab-date/js-lib',
    });
}