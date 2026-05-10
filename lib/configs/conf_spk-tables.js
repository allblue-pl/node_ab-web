export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/spk-tables/scss',
    ])
        .extArr(build.data['spocky'].packages, [
        build.settings.config.dev + '/node_modules/spk-tables',
    ]);
};
