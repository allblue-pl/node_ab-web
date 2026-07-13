                                             

export default (build           )            => {
    return build
        .extendObject(build.data['js-libs'].libs, {
            'js0': build.devFSPath + '/node_modules/js0/js-lib',
        });
}