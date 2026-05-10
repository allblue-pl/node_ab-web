export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-fields': build.devFSPath + '/node_modules/ab-fields/js-lib',
    });
};
