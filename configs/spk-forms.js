'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .init('ab-bootstrap-datetimepicker')
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/spk-file-upload/scss',
        ])
        .extArr(data['spocky']['packages'], [
            devPath + '/node_modules/spk-forms',
        ]);   
}