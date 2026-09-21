import type BuildData from "../BuildData.ts";
import moment from "./moment.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(moment)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/@allblue/e-libs`,
                libs: {
                    "@allblue/e-libs": `${build.devFSPath}/node_modules/@allblue/e-libs`,
                },
            }
        ]);
}