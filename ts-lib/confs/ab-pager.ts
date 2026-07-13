import ts0 from "./ts0.ts";
import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(ts0)
        .extArr(build.data['js-libs'].tsPkgs, [{
            tsconfig: build.devFSPath + '/node_modules/ab-pager',
            libs: {
                "ab-pager": build.devFSPath + '/node_modules/ab-pager',
            },
        }]);
}