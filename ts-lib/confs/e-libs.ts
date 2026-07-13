import type BuildData from "../BuildData.ts";

export default (build: BuildData, espadaFSPath: string): BuildData => {
    return build
        .extArr(build.data['js-libs'].tsPkgs, [
            {   
                tsconfig: null,
                libs: {
                    "e-libs": `${espadaFSPath}/esite/packages/ecore/ELibs/js-libs/e-libs`,
                },
            }
        ]);   
}