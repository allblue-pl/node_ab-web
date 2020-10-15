'use strict';

module.exports.init = function(conf, data) 
{
    require('./ab-fields').init(conf, data);
    require('./ab-layouts').init(conf, data);
    require('./ab-nodes').init(conf, data);
    require('./ab-strings').init(conf, data);
    require('./ab-text-parser').init(conf, data);
    
    conf.extObj(data['js-libs'].libs, {
        'spocky': '../dev/node_modules/spocky/js-lib',
    });
}

