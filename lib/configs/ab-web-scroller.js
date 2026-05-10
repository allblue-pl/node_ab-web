import jquery from "./jquery.js";
import js0 from "./js0.js";
export default (build) => {
    return build
        .init(jquery)
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
        'ab-web-scroller': build.devFSPath + '/node_modules/ab-web-scroller/js-lib',
    });
};
