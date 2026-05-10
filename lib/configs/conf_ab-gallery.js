export default (build) => {
    return build
        .init('jquery')
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/blueimp-gallery/css/blueimp-gallery.min.css',
    ])
        .extArr(build.data['js']['include'], [
        build.settings.config.dev + '/node_modules/blueimp-gallery/js/blueimp-gallery.min.js',
        build.settings.config.dev + '/node_modules/ab-gallery/js/ab-gallery.js',
    ])
        .extArr(build.data['dist']['paths'], [
        build.settings.config.dev + '/node_modules/blueimp-gallery/img/**',
    ]);
};
