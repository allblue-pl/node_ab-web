                                             

export default (build           )            => {
    return build
        .extArr(build.data['js']['include'], [
            build.devFSPath + '/node_modules/jquery/dist/jquery.min.js',
        ]);
}