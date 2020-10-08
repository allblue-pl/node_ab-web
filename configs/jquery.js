'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendArray(data['js']['include'], [
        '../dev/node_modules/jquery/dist/jquery.js',
    ]);
}