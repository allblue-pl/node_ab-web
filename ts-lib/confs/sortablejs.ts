import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['js']['include'], [
            build.devFSPath + '/node_modules/sortablejs/Sortable.js',
        ]);
}