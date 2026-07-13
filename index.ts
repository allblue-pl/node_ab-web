import abConfs from "./ts-lib/ab-confs.js"
import abWeb from "./ts-lib/index.js";
import CopyExt from "./ts-lib/exts/ab-web_copy/CopyExt.js";
import DistExt from "./ts-lib/exts/ab-web_dist/DistExt.js";
import HeaderExt from "./ts-lib/exts/ab-web_header/HeaderExt.js";
import JSExt from "./ts-lib/exts/ab-web_js/JSExt.js";
import JSLibsExt from "./ts-lib/exts/ab-web_js-libs/JSLibsExt.js";
import ReplaceHeaderExt from "./ts-lib/exts/ab-web_replace-header/ReplaceHeaderExt.ts";
import SassExt from "./ts-lib/exts/ab-web_sass/SassExt.js";
import SpockyExt from "./ts-lib/exts/ab-web_spocky/SpockyExt.js";
import TestExt from "./ts-lib/exts/ab-web_test/TestExt.js";
import TSValidatorExt from "./ts-lib/exts/ab-web_ts-validator/TSValidatorExt.ts"
import type { ConfigPreset, InitFn } from "./ts-lib/ts-types.ts";
import BuildData from "./ts-lib/BuildData.ts";

export default abWeb;
export { abConfs }
export { CopyExt, DistExt, HeaderExt, JSExt, JSLibsExt, ReplaceHeaderExt, SassExt, 
        SpockyExt, TestExt, TSValidatorExt };
export type { BuildData, ConfigPreset, InitFn };