export default (build) => {
    return build
        .init("./ab-strings")
        .init("./ab-text")
        .init("./js0")
        .init("./web-ab-api")
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.data': build.settings.config.dev + '/node_modules/ab-build.data/js-lib',
    });
};
