import type BuildData from "../BuildData.ts";
import abData from "./ab-data.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abData)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-data_espada_ab-data`,
                libs: {
                    'ab-data_espada_ab-data': `${build.devFSPath}/node_modules/ab-data_espada_ab-data`,
                },
            },
        ]);
}