export default (build) => {
    return build
        .extArr(build.data['js']['include'], [
        build.settings.config.dev + '/node_modules/sortablejs/Sortable.js',
    ]);
};
