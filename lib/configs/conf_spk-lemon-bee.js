export default (build) => {
    return build
        .init('ab-pager')
        .init('spk-messages')
        .init('spocky')
        .init('web-ab-api')
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/spk-lemon-bee/scss',
    ])
        .extArr(build.data['spocky']['packages'], [
        build.settings.config.dev + '/node_modules/spk-lemon-bee',
    ])
        .extArr(build.data['dist']['paths'], [
        build.settings.config.dev + '/node_modules/spk-lemon-bee/images/**',
    ]);
};
