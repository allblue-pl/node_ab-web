                                             
import abText from "./ab-text.js";

export default (build           )            => {
    return build
        .init(abText)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: build.devFSPath + "/node_modules/web-ab-api",
                libs: {
                    'web-ab-api': build.devFSPath + '/node_modules/web-ab-api',
                }
            }
        ]);
}