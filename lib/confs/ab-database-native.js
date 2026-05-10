import abLock from "./ab-lock.js";
import js0 from "./js0.js";
export default (build) => {
    return build
        .init(abLock)
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
        'ab-build.database-native': build.devFSPath + '/node_modules/ab-build.database-native/js-lib',
    });
};
