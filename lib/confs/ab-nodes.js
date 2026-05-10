export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-nodes': build.devFSPath + '/node_modules/ab-nodes/js-lib',
    });
};
