export default (build) => {
    return build
        .init("./ab-fields")
        .init("./ab-layouts")
        .init("./ab-nodes")
        .init("./ab-strings")
        .init("./ab-text-parser")
        .extObj(build.data['js-libs'].libs, {
        'spocky': build.settings.config.dev + '/node_modules/spocky/js-lib',
    });
};
