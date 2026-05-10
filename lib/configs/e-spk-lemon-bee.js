export default (build) => {
    return build
        .extArr(build.data['spocky']['packages'], [
        '../esite/packages/ecore/LemonBee/spk/spk-e-lemon-bee',
    ]);
};
