                                             

export default (build           )            => {
    return build
        .extArr(build.data['spocky']['tsPkgs'], [
            {
                tsconfig: `${build.devFSPath}/node_modules/spk-e-files-upload`,
                libs: {
                    "spk-e-files-upload": `${build.devFSPath}/node_modules/spk-e-files-upload`,
                },
            }
        ]);
}