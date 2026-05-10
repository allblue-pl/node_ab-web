export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/spk-messages/scss',
    ])
        .extArr(build.data['spocky']['packages'], [
        build.settings.config.dev + '/node_modules/spk-messages',
    ])
        .extArr(build.data['dist']['paths'], [
        build.settings.config.dev + '/node_modules/spk-messages/images/**',
    ]);
};
