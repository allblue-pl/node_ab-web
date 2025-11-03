'use strict';

module.exports.init = function(conf, data)  {
    conf.extArr(data['js']['include'], [
        '../dev/node_modules/qrcode-generator/dist/qrcode.js',
    ]);
    conf.extendObject(data['js-libs'].libs, {
        'ab-qr-codes-generator': '../dev/node_modules/ab-qr-codes-generator/js-lib',
    });
}