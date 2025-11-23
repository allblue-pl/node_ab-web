'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/spk-tables/scss',
        ])
        .extArr(data['spocky'].packages, [
            devPath + '/node_modules/spk-tables',
        ]);   
}