import moment from "./moment.js";
export default (build) => {
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
};
