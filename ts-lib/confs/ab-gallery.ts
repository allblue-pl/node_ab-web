import type BuildData from "../BuildData.ts";
import jquery from "./jquery.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(jquery)
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/blueimp-gallery/css/blueimp-gallery.min.css',
        ])
        .extArr(build.data['js']['include'], [
            build.devFSPath + '/node_modules/blueimp-gallery/js/blueimp-gallery.min.js',
            build.devFSPath + '/node_modules/ab-gallery/js/ab-gallery.js',
        ])
        .extArr(build.data['dist']['paths'], [
            build.devFSPath + '/node_modules/blueimp-gallery/img/**',
        ]);
}