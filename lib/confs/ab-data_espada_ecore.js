                                             
import abData from "./ab-data.js";

export default (build           )            => {
    return build
        .init(abData)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-data_espada_ecore`,
                libs: {
                    'ab-data_espada_ecore': `${build.devFSPath}/node_modules/ab-data_espada_ecore`,
                },
            },
        ]);
}