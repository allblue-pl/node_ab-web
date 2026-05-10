export default (build) => {
    return build
        .init('moment')
        .extendObject(build.data['js-libs'].libs, {
        'ab-date': build.settings.config.dev + '/node_modules/ab-date/js-lib',
    })
        .extendObject(build.data['js-libs'].libs, {
        'moment': build.settings.config.dev + '/node_modules/ab-date/moment/js-lib',
    })
        .extendObject(build.data['js-libs'].libs, {
        'moment-timezone': build.settings.config.dev + '/node_modules/ab-date/moment-timezone/js-lib',
    });
};
