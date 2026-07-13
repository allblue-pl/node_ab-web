                                             

export default (build           )            => {
    return build
        .extendObject(build.data['js-libs'].libs, {
            'ab-time': build.devFSPath + '/node_modules/ab-time/js-lib',
        });
}