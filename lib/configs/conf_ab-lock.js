export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-lock': build.settings.config.dev + '/node_modules/ab-lock/js-lib',
    });
};
