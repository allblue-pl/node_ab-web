export default (build) => {
    return build
        .extendObject(build.data['js-libs'].libs, {
        'e-tasks': '../esite/packages/ecore/Tasks/js-libs/e-tasks',
    });
};
