export default (build) => {
    return build
        .extArr(build.data['js']['include'], [
        build.devFSPath + '/node_modules/qrcode-generator/dist/qrcode.js',
    ])
        .extendObject(build.data['js-libs'].libs, {
        'ab-qr-codes-generator': build.devFSPath + '/node_modules/ab-qr-codes-generator/js-lib',
    });
};
