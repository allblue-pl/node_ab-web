                                             

export default (build           )            => {
    return build
        .extArr(build.data['js-libs'].tsPkgs, [{
            tsconfig: build.devFSPath + '/node_modules/ab-text',
            libs: {
                "ab-text": build.devFSPath + '/node_modules/ab-text',
            },
        }]);
}