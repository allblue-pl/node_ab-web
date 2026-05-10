import type BuildData from "../BuildData.ts";
import jquery from "./jquery.ts";
import moment from "./moment.ts";

export default (build: BuildData): BuildData => {
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
}