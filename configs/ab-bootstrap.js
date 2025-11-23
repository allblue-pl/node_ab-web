'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['sass']['paths'], [
        devPath + '/node_modules/ab-bootstrap/scss',
    ]);

    conf.extArr(data['js']['include'], [
        devPath + '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
        devPath + '/node_modules/@popperjs/core/dist/umd/popper.js',
    ]);
}