export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-lock': build.devFSPath + '/node_modules/ab-lock/js-lib',
    });
};
