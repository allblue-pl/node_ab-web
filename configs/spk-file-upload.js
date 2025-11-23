'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/spk-file-upload/scss',
        ])
        .extArr(data['spocky']['packages'], [
            devPath + '/node_modules/spk-file-upload',
        ])
        .extArr(data['dist'].paths, [
            devPath + '/node_modules/spk-file-upload/images/**',
        ]);   
}