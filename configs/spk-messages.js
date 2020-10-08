'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendArray(data['spocky'].packages, [
        '../dev/node_modules/spk-messages',
    ]);   
}