'use strict';

module.exports.init = function(conf, data) 
{
    conf.init('ab-bootstrap-datetimepicker');

    conf.extendArray(data['spocky'].packages, [
        '../dev/node_modules/spk-forms',
    ]);   
}