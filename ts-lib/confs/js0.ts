import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extendObject(build.data['js-libs'].libs, {
            'js0': build.devFSPath + '/node_modules/js0/js-lib',
        });
}