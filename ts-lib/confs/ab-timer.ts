import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extendObject(build.data['js-libs'].libs, {
            'ab-timer': build.devFSPath + '/node_modules/ab-timer/js-lib',
        });
}