
import type BuildData from "../BuildData.ts";
import abBootstrapDatetimepicker from "./ab-bootstrap-datetimepicker.ts";
import abDate from "./ab-date.ts";
import ts0 from "./ts0.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abDate)
        .init(abBootstrapDatetimepicker)
        .init(ts0)
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/spk-file-upload/scss',
        ])
        .extArr(build.data['spocky']['tsPkgs'], [
            {
                tsconfig: `${build.devFSPath}/node_modules/spk-forms`,
                libs: {
                    "spk-forms": `${build.devFSPath}/node_modules/spk-forms`,
                },
            }
        ]);   
}