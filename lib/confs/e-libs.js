                                             
import moment from "./moment.js";

export default (build           )            => {
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