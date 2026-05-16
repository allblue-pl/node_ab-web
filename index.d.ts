import abConfs from "./ts-lib/ab-confs.ts"
import abWeb from "./ts-lib/index.ts";
import BuildData from "./ts-lib/BuildData.ts";
import type { ConfigPreset, InitFn } from "./ts-lib/ts-types.ts";
import CopyExt from "./ts-lib/exts/ab-web_copy/CopyExt.ts";
import DistExt from "./ts-lib/exts/ab-web_dist/DistExt.ts";
import HeaderExt from "./ts-lib/exts/ab-web_header/HeaderExt.ts";
import JSExt from "./ts-lib/exts/ab-web_js/JSExt.ts";
import JSLibsExt from "./ts-lib/exts/ab-web_js-libs/JSLibsExt.ts";
import SassExt from "./ts-lib/exts/ab-web_sass/SassExt.ts";
import SpockyExt from "./ts-lib/exts/ab-web_spocky/SpockyExt.ts";
import TestExt from "./ts-lib/exts/ab-web_test/TestExt.ts";

export default abWeb;
export { abConfs };
export { CopyExt, DistExt, HeaderExt, JSExt, JSLibsExt, SassExt, SpockyExt, TestExt };
export type { BuildData, ConfigPreset, InitFn };