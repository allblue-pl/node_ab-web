import type BuildData from "../BuildData.ts";
import abText from "./ab-text.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abText)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: build.devFSPath + "/node_modules/web-ab-api",
                libs: {
                    'web-ab-api': build.devFSPath + '/node_modules/web-ab-api',
                }
            }
        ]);
}