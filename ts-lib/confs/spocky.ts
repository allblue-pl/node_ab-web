import type BuildData from "../BuildData.ts";
import abFields from "./ab-fields.ts";
import abLayouts from "./ab-layouts.ts";
import abNodes from "./ab-nodes.ts";
import abStrings from "./ab-strings.ts";
import abTextParser from "./ab-text-parser.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abFields)
        .init(abLayouts)
        .init(abNodes)
        .init(abStrings)
        .init(abTextParser)
        .extObj(build.data['js-libs'].libs, {
            'spocky': build.devFSPath + '/node_modules/spocky/js-lib',
        });
}

