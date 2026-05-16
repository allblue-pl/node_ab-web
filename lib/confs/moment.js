export default (build) => {
    return build
        .extArr(build.data['js']['include'], [
        build.devFSPath + '/node_modules/moment/min/moment-with-locales.js',
        build.devFSPath + '/node_modules/moment-timezone/builds/moment-timezone-with-data-1970-2030.min.js',
    ]);
};
