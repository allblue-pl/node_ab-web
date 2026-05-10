export default (build) => {
    return build
        .extArr(build.data['js']['include'], [
        build.settings.config.dev + '/node_modules/moment/min/moment-with-locales.js',
        build.settings.config.dev + '/node_modules/moment-timezone/builds/moment-timezone-with-build.data-1970-2030.min.js',
    ]);
};
