export default (build) => {
    return build
        .extArr(build.data['dist'].paths, [
        build.settings.config.dev + '/node_modules/spk-tinymce/css/**',
        build.settings.config.dev + '/node_modules/tinymce/icons/**',
        build.settings.config.dev + '/node_modules/tinymce/plugins/**',
        build.settings.config.dev + '/node_modules/tinymce/skins/**',
        build.settings.config.dev + '/node_modules/tinymce/themes/**',
    ])
        .extArr(build.data['js'].compile, [
        build.settings.config.dev + '/node_modules/tinymce/tinymce.js',
    ])
        .extArr(build.data['spocky'].packages, [
        build.settings.config.dev + '/node_modules/spk-tinymce',
    ]);
};
