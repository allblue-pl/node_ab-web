export default (build) => {
    return build
        .init("./ab-lock")
        .init("./js0")
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.database-native': build.settings.config.dev + '/node_modules/ab-build.database-native/js-lib',
    });
};
