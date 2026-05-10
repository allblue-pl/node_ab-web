export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-layouts': build.settings.config.dev + '/node_modules/ab-layouts/js-lib',
    });
};
