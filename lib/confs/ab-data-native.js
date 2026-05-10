import abDatabaseNative from "./ab-database-native.js";
import js0 from "./js0.js";
import webABApi from "./web-ab-api.js";
export default (build) => {
    return build
        .init(abDatabaseNative)
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.data-native': build.devFSPath + '/node_modules/ab-build.data-native/js-lib',
    });
};
