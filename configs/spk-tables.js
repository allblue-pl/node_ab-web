'use strict';

module.exports.init = function(conf, data) 
{
    conf
        .extArr(data['sass']['paths'], [
            '../dev/node_modules/spk-tables/scss',
        ])
        .extArr(data['spocky'].packages, [
            '../dev/node_modules/spk-tables',
        ]);   
}