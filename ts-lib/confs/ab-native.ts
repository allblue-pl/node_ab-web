import type BuildData from "../BuildData.ts";
import js0 from "./js0.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
            'ab-native': build.devFSPath + '/node_modules/ab-native/js-lib',
        });
}