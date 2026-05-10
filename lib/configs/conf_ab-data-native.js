import abDatabaseNative from "./ab-database-native.js";
export default (build) => {
    return build
        .init(abDatabaseNative)
        .init("./ab-build.database-native")
        .init("./js0")
        .init("./web-ab-api")
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.data-native': build.settings.config.dev + '/node_modules/ab-build.data-native/js-lib',
    });
};
