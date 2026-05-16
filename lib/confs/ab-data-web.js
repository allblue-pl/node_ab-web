import js0 from "./js0.js";
import webABApi from "./web-ab-api.js";
export default (build) => {
    return build
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
        'ab-data-web': build.devFSPath + '/node_modules/ab-data-web/js-lib',
    });
};
