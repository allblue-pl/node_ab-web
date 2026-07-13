import ts0 from "./ts0.js";
                                             

export default (build           )            => {
    return build
        .init(ts0)
        .extArr(build.data['js-libs'].tsPkgs, [{
            tsconfig: build.devFSPath + '/node_modules/ab-pager',
            libs: {
                "ab-pager": build.devFSPath + '/node_modules/ab-pager',
            },
        }]);
}