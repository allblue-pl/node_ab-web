export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-text-parser': build.devFSPath + '/node_modules/ab-text-parser/js-lib',
    });
};
