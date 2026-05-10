import abBootstrapDatetimepicker from "./ab-bootstrap-datetimepicker.js";
export default (build) => {
    return build
        .init(abBootstrapDatetimepicker)
        .extArr(build.data['sass']['paths'], [
        build.devFSPath + '/node_modules/spk-file-upload/scss',
    ])
        .extArr(build.data['spocky']['packages'], [
        build.devFSPath + '/node_modules/spk-forms',
    ]);
};
