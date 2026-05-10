export default (build) => {
    return build
        .init("./js0")
        .init("./web-ab-api")
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.data-web': build.settings.config.dev + '/node_modules/ab-build.data-web/js-lib',
    });
};
