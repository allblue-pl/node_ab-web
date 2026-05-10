export default (build) => {
    return build
        .extArr(build.data['sass']['paths'], [
        build.devFSPath + '/node_modules/spk-tables/scss',
    ])
        .extArr(build.data['spocky'].packages, [
        build.devFSPath + '/node_modules/spk-tables',
    ]);
};
