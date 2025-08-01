'use strict';

module.exports.init = function(conf, data)  {
    conf
        .init('ab-bootstrap-datetimepicker')
        .extArr(data['sass']['paths'], [
            '../dev/node_modules/spk-file-upload/scss',
        ])
        .extArr(data['spocky']['packages'], [
            '../dev/node_modules/spk-forms',
        ]);   
}