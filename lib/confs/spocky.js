import abFields from "./ab-fields.js";
import abLayouts from "./ab-layouts.js";
import abNodes from "./ab-nodes.js";
import abStrings from "./ab-strings.js";
import abTextParser from "./ab-text-parser.js";
export default (build) => {
    return build
        .init(abFields)
        .init(abLayouts)
        .init(abNodes)
        .init(abStrings)
        .init(abTextParser)
        .extObj(build.data['js-libs'].libs, {
        'spocky': build.devFSPath + '/node_modules/spocky/js-lib',
    });
};
