'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['js']['include'], [
        devPath + '/node_modules/qrcode-generator/dist/qrcode.js',
    ]);
    conf.extendObject(data['js-libs'].libs, {
        'ab-qr-codes-generator': devPath + '/node_modules/ab-qr-codes-generator/js-lib',
    });
}