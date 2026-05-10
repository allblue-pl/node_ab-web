import jquery from "./jquery.js";
import moment from "./moment.js";
export default (build) => {
    return build
        .init(jquery)
        .init(moment)
        .extArr(build.data['sass']['paths'], [
        build.devFSPath +
            '/node_modules/ab-bootstrap-datetimepicker/src/' +
            'sass/bootstrap-datetimepicker-build.scss',
    ])
        .extArr(build.data['js']['include'], [
        build.devFSPath +
            '/node_modules/ab-bootstrap-datetimepicker/src/' +
            'js/bootstrap-datetimepicker.js',
    ]);
};
