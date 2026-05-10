export default (build) => {
    return build
        .init('jquery')
        .init('js0')
        .extendObject(build.data['js-libs'].libs, {
        'ab-web-scroller': build.settings.config.dev + '/node_modules/ab-web-scroller/js-lib',
    });
};
