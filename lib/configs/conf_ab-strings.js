export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-strings': build.settings.config.dev + '/node_modules/ab-strings/js-lib',
    });
};
