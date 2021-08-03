'use strict';

module.exports.init = function(conf, data) 
{
    conf.init('jquery');
    conf.init('moment');

    conf.extArr(data['sass']['paths'], [
        '../dev/node_modules/ab-bootstrap-datetimepicker/src/sass/bootstrap-datetimepicker-build.scss',
    ]);

    conf.extArr(data['js']['include'], [
        '../dev/node_modules/ab-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
    ]);
}