export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'ab-pager': build.settings.config.dev + '/node_modules/ab-pager/js-lib',
    });
};
