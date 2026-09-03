                                             
import abLock from "./ab-lock.js";
import js0 from "./js0.js";

export default (build           )            => {
    return build
        .init(abLock)
        .init(js0)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-database-native`,
                libs: {
                    'ab-database-native': 
                            `${build.devFSPath}/node_modules/ab-database-native`,
                }
            }
        ]);
}