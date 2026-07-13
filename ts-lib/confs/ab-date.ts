import type BuildData from "../BuildData.ts";
import moment from "./moment.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(moment)
        .extArr(build.data['js-libs'].tsPkgs, [
            {
                tsconfig: `${build.devFSPath}/node_modules/ab-date`,
                libs: {
                    "ab-date": `${build.devFSPath}/node_modules/ab-date`,
                },
            }
        ])
        .extObj(build.data['js-libs'].libs, {
            'moment': build.devFSPath + '/node_modules/ab-date/moment/js-lib',
        })
        .extObj(build.data['js-libs'].libs, {
            'moment-timezone': build.devFSPath + '/node_modules/ab-date/moment-timezone/js-lib',
        });
}