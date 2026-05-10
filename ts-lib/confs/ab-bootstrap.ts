import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/ab-bootstrap/scss',
        ])
        .extArr(build.data['js']['include'], [
            build.devFSPath + '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
            build.devFSPath + '/node_modules/@popperjs/core/dist/umd/popper.js',
        ]);
}