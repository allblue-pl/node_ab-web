export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-timer': build.devFSPath + '/node_modules/ab-timer/js-lib',
    });
};
