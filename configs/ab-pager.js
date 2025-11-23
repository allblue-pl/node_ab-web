'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extendObject(data['js-libs'].libs, {
        'ab-pager': devPath + '/node_modules/ab-pager/js-lib',
    });   
}