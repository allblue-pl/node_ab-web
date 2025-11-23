'use strict';

module.exports.init = function(conf, data, devPath)  {
    // conf.init('jquery');
    conf
        .init('jquery')
        .init('moment')
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/ab-bootstrap-datetimepicker/src/sass/bootstrap-datetimepicker-build.scss',
        ])
        .extArr(data['js']['include'], [
            devPath + '/node_modules/ab-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
        ]);
}