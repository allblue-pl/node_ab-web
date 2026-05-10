export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/ab-bootstrap/scss',
    ])
        .extArr(build.data['js']['include'], [
        build.settings.config.dev + '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
        build.settings.config.dev + '/node_modules/@popperjs/core/dist/umd/popper.js',
    ]);
};
