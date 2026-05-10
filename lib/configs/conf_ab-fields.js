export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-fields': build.settings.config.dev + '/node_modules/ab-fields/js-lib',
    });
};
