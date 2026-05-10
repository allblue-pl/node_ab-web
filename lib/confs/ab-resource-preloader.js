export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-resource-preloader': build.devFSPath + '/node_modules/ab-resource-preloader/js-lib',
    });
};
