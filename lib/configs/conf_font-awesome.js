export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/git/Font-Awesome/scss/brands.scss',
        build.settings.config.dev + '/git/Font-Awesome/scss/regular.scss',
        build.settings.config.dev + '/git/Font-Awesome/scss/solid.scss',
        build.settings.config.dev + '/git/Font-Awesome/scss/fontawesome.scss',
    ])
        .extArr(build.data['dist']['paths'], [
        build.settings.config.dev + '/git/Font-Awesome/webfonts/**',
    ]);
};
