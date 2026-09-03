                                             

export default (build           )            => {
    return build
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-lock`,
                libs: {
                    "ab-lock": `${build.devFSPath}/node_modules/ab-lock`,
                }
            }
        ]);
}