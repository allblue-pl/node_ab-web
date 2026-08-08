import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-strings`,
                libs: {
                    'ab-strings': `${build.devFSPath}/node_modules/ab-strings`,
                },
            },
        ]);
}