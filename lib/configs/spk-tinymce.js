export default (build) => {
    return build
        .extArr(build.data['dist'].paths, [
        build.devFSPath + '/node_modules/spk-tinymce/css/**',
        build.devFSPath + '/node_modules/tinymce/icons/**',
        build.devFSPath + '/node_modules/tinymce/plugins/**',
        build.devFSPath + '/node_modules/tinymce/skins/**',
        build.devFSPath + '/node_modules/tinymce/themes/**',
    ])
        .extArr(build.data['js'].compile, [
        build.devFSPath + '/node_modules/tinymce/tinymce.js',
    ])
        .extArr(build.data['spocky'].packages, [
        build.devFSPath + '/node_modules/spk-tinymce',
    ]);
};
