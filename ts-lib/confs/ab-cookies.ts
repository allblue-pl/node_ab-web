import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['js-libs']['tsPkgs'], [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-cookies`,
                libs: {
                    "ab-cookies": `${build.devFSPath}/node_modules/ab-cookies`,
                },
            },
        ]);
}