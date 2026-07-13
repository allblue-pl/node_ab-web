                                             

export default (build           )            => {
    return build
        .extendObject(build.data['js-libs'].libs, {
            'ab-strings': build.devFSPath + '/node_modules/ab-strings/js-lib',
        });
}