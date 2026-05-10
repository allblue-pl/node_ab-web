export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-time': build.settings.config.dev + '/node_modules/ab-time/js-lib',
    });
};
