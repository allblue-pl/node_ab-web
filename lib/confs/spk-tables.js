                                             

export default (build           )            => {
    return build
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/spk-tables/scss',
        ])
        .extArr(build.data['spocky'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/spk-tables`,
                libs: {
                    "spk-tables": `${build.devFSPath}/node_modules/spk-tables`,
                },
            }
        ])
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/spk-tables_presets`,
                libs: {
                    "spk-tables_presets": `${build.devFSPath}/node_modules/spk-tables_presets`,
                },
            }
        ]); 
}