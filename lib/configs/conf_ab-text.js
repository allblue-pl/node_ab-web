export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-text': build.settings.config.dev + '/node_modules/ab-text/js-lib',
    });
};
