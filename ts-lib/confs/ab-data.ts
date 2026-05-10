import type BuildData from "../BuildData.ts";
import abStrings from "./ab-strings.ts";
import abText from "./ab-text.ts";
import js0 from "./js0.ts";
import webABApi from "./web-ab-api.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abStrings)
        .init(abText)
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
            'ab-build.data': build.devFSPath + '/node_modules/ab-build.data/js-lib',
        });
}