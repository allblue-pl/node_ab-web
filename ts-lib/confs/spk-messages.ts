import type BuildData from "../BuildData.ts";
import abText from "./ab-text.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abText)
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/spk-messages/scss',
        ])
        .extArr(build.data['spocky']['tsPkgs'], [
            {
                tsconfig: `${build.devFSPath}/node_modules/spk-messages`,
                libs: {
                    "spk-messages": `${build.devFSPath}/node_modules/spk-messages`,
                },
            }
        ])
        .extArr(build.data['dist']['paths'], [
            build.devFSPath + '/node_modules/spk-messages/images/**/*',
        ]);
}