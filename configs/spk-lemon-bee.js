'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .init('ab-pager')
        .init('spk-messages')
        .init('spocky')
        .init('web-ab-api')
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/spk-lemon-bee/scss',
        ])
        .extArr(data['spocky']['packages'], [
            devPath + '/node_modules/spk-lemon-bee',        
        ])
        .extArr(data['dist']['paths'], [
            devPath + '/node_modules/spk-lemon-bee/images/**',        
        ]);
}