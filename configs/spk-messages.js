'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/spk-messages/scss',
        ])
        .extArr(data['spocky']['packages'], [
            devPath + '/node_modules/spk-messages',
        ])
        .extArr(data['dist']['paths'], [
            devPath + '/node_modules/spk-messages/images/**',
        ]);
}