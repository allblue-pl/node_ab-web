'use strict';

module.exports.init = function(conf, data) 
{
    conf.extArr(data['sass']['paths'], [
        '../dev/node_modules/ab-bootstrap/scss',
    ]);

    conf.extArr(data['js']['include'], [
        '../dev/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
        '../dev/node_modules/popper.js/dist/umd/popper.js',
    ]);
}