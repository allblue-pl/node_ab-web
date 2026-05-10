export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.devFSPath + '/node_modules/spk-messages/scss',
    ])
        .extArr(build.data['spocky']['packages'], [
        build.devFSPath + '/node_modules/spk-messages',
    ])
        .extArr(build.data['dist']['paths'], [
        build.devFSPath + '/node_modules/spk-messages/images/**',
    ]);
};
