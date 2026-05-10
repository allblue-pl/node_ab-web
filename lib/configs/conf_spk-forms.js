export default (build) => {
    return build
        .init('ab-bootstrap-datetimepicker')
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev + '/node_modules/spk-file-upload/scss',
    ])
        .extArr(build.data['spocky']['packages'], [
        build.settings.config.dev + '/node_modules/spk-forms',
    ]);
};
