                                             
import js0 from "./js0.js";

export default (build           )            => {
    return build
        .init(js0)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-native`,
                libs: {
                    'ab-native': `${build.devFSPath}/node_modules/ab-native/`,
                },
            }
        ]);
}