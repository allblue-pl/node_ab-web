                                             

export default (build           , espadaFSPath        )            => {
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