import type BuildData from "../BuildData.ts";
import abLock from "./ab-lock.ts";
import js0 from "./js0.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abLock)
        .init(js0)
        .extendObject(build.data['js-libs'].libs, {
            'ab-database-native': build.devFSPath + '/node_modules/ab-database-native/js-lib',
        });
}