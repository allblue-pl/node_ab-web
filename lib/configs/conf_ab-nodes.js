export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-nodes': build.settings.config.dev + '/node_modules/ab-nodes/js-lib',
    });
};
