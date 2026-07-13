import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['js-libs'].tsPkgs, [{
            tsconfig: build.devFSPath + '/node_modules/@allblue/ts0',
            libs: {
                "@allblue/ts0": build.devFSPath + '/node_modules/@allblue/ts0',
            },
        }]);
}