                                             

export default (build           )            => {
    return build
        /* Tagify */
        .extArr(build.data['sass']['paths'], [
            `${build.devFSPath}/node_modules/@yaireo/tagify/src/tagify.scss`,
        ])
        .extArr(build.data['js']['include'], [
            `${build.devFSPath}/node_modules/@yaireo/tagify/dist/tagify.js`,
        ])
        /* AB Tags */
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/ab-tags/scss',
        ])
        .extArr(build.data['js-libs']['tsPkgs'], [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-tags`,
                libs: {
                    "ab-tags": `${build.devFSPath}/node_modules/ab-tags`,
                },
            },
        ]);
}