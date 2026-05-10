import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['spocky']['packages'], [
            '../esite/packages/ecore/LemonBee/spk/spk-e-lemon-bee',
        ]);   
}