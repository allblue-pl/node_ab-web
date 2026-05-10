import js0 from "./js0.js";
export default (build) => {
    return build
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
        'ab-native': build.devFSPath + '/node_modules/ab-native/js-lib',
    });
};
