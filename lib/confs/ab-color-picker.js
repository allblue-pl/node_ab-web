                                             

export default (build           )            => {
    return build
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/@simonwep/pickr/dist/themes/nano.min.css',
        ])
        .extArr(build.data['js']['include'], [
            build.devFSPath + '/node_modules/@simonwep/pickr/dist/pickr.min.js',
        ])
        .extArr(build.data["js-libs"].tsPkgs, [
            {
                tsconfig: build.devFSPath + '/node_modules/ab-color-picker',
                libs: {
                    'ab-color-picker': build.devFSPath + '/node_modules/ab-color-picker',
                },
            },
        ]);
}