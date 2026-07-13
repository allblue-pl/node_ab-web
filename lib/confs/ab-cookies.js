                                             

export default (build           )            => {
    return build
        .extendObject(build.data['js-libs']['libs'], {
            'ab-cookies': build.devFSPath + '/node_modules/ab-cookies/js-lib',
        });
}