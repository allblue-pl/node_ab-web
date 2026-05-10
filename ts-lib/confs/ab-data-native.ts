import type BuildData from "../BuildData.ts";
import abDatabaseNative from "./ab-database-native.ts";
import js0 from "./js0.ts";
import webABApi from "./web-ab-api.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abDatabaseNative)
        .init(js0)
        .init(webABApi)
        .extendObject(build.data['js-libs'].libs, {
            'ab-build.data-native': build.devFSPath + '/node_modules/ab-build.data-native/js-lib',
        });
}