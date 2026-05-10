import type BuildData from "../BuildData.ts";
import jquery from "./jquery.ts";
import js0 from "./js0.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(jquery)
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
            'ab-web-scroller': build.devFSPath + '/node_modules/ab-web-scroller/js-lib',
        });
}