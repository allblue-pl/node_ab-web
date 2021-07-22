'use strict';

module.exports.init = function(conf, data) 
{
    conf.extArr(data['spocky'].packages, [
        '../dev/node_modules/spk-tables',
    ]);   
}