export default (build) => {
    return build
        .extArr(build.data['sass'].paths, [
        build.devFSPath + '/node_modules/magda-styles/scss',
    ]);
};
