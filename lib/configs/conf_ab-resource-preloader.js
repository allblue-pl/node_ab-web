export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-resource-preloader': build.settings.config.dev + '/node_modules/ab-resource-preloader/js-lib',
    });
};
