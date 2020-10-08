'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendObject(data['js-libs'].libs, {
        'ab-pager': '../dev/node_modules/ab-pager/js-lib',
    });   
}