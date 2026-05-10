export default (build) => {
    return build
        .extendObject(build.data['js-libs']['libs'], {
        'ab-cookies': build.settings.config.dev + '/node_modules/ab-cookies/js-lib',
    });
};
