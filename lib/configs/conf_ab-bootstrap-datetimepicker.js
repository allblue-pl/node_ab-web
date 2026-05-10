import conf_jquery from "./conf_jquery.js";
export default (build) => {
    return build
        .init(conf_jquery)
        .init(moment)
        .extArr(build.data['sass']['paths'], [
        build.settings.config.dev +
            '/node_modules/ab-bootstrap-datetimepicker/src/' +
            'sass/bootstrap-datetimepicker-build.scss',
    ])
        .extArr(build.data['js']['include'], [
        build.settings.config.dev +
            '/node_modules/ab-bootstrap-datetimepicker/src/' +
            'js/bootstrap-datetimepicker.js',
    ]);
};
