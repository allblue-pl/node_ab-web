export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'web-ab-api': build.settings.config.dev + '/node_modules/web-ab-api/js-lib',
    });
};
