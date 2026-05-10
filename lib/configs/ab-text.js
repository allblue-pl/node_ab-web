export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-text': build.devFSPath + '/node_modules/ab-text/js-lib',
    });
};
