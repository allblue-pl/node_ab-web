                                             
import abStrings from "./ab-strings.js";
import abText from "./ab-text.js";
import js0 from "./js0.js";
import webABApi from "./web-ab-api.js";

export default (build           )            => {
    return build
        .init(abStrings)
        .init(abText)
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
            'ab-data': build.devFSPath + '/node_modules/ab-data/js-lib',
        });
}