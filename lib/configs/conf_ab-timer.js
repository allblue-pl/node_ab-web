export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-timer': build.settings.config.dev + '/node_modules/ab-timer/js-lib',
    });
};
