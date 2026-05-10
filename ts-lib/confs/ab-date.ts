import type BuildData from "../BuildData.ts";
import moment from "./moment.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(moment)
        .extendObject(build.data['js-libs'].libs, {
            'ab-date': build.devFSPath + '/node_modules/ab-date/js-lib',
        })
        .extendObject(build.data['js-libs'].libs, {
            'moment': build.devFSPath + '/node_modules/ab-date/moment/js-lib',
        })
        .extendObject(build.data['js-libs'].libs, {
            'moment-timezone': build.devFSPath + '/node_modules/ab-date/moment-timezone/js-lib',
        });
}