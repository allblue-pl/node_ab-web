                                             

export default (build           )            => {
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