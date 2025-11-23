'use strict';

module.exports.init = function(conf, data, devPath)  {
    require('./ab-fields').init(conf, data, devPath);
    require('./ab-layouts').init(conf, data, devPath);
    require('./ab-nodes').init(conf, data, devPath);
    require('./ab-strings').init(conf, data, devPath);
    require('./ab-text-parser').init(conf, data, devPath);
    
    conf.extObj(data['js-libs'].libs, {
        'spocky': devPath + '/node_modules/spocky/js-lib',
    });
}

