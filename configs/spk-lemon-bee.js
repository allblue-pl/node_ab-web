'use strict';

module.exports.init = function(conf, data) 
{
    conf
        .init('ab-pager')
        .init('spk-messages')
        .init('spocky')
        .init('web-ab-api')
        .extArr(data['sass']['paths'], [
            '../dev/node_modules/spk-lemon-bee/scss',
        ])
        .extArr(data['spocky']['packages'], [
            '../dev/node_modules/spk-lemon-bee',        
        ])
        .extArr(data['dist']['paths'], [
            '../dev/node_modules/spk-lemon-bee/images',        
        ]);
}