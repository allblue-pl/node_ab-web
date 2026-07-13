                                             
import moment from "./moment.js";

export default (build           )            => {
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