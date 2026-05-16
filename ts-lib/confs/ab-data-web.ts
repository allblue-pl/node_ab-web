import type BuildData from "../BuildData.ts";
import js0 from "./js0.ts";
import webABApi from "./web-ab-api.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
            'ab-data-web': build.devFSPath + '/node_modules/ab-data-web/js-lib',
        });
}