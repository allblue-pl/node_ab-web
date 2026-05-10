export default (build) => {
    return build
        .init("./js0")
        .extendObject(build.data['js-libs'].libs, {
        'ab-native': build.settings.config.dev + '/node_modules/ab-native/js-lib',
    });
};
