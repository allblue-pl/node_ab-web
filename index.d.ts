import abConfs from "./ts-lib/ab-confs.ts"
import abWeb from "./ts-lib/index.ts";
import BuildData from "./ts-lib/BuildData.ts";
import type { ConfigPreset, InitFn } from "./ts-lib/ts-types.ts";
import HeaderExt from "./ts-lib/exts/ab-web_header/HeaderExt.ts";
import JSExt from "./ts-lib/exts/ab-web_js/JSExt.ts";
import JSLibsExt from "./ts-lib/exts/ab-web_js-libs/JSLibsExt.ts";
import SassExt from "./ts-lib/exts/ab-web_sass/SassExt.ts";

export default abWeb;
export { abConfs };
export { HeaderExt, JSExt, JSLibsExt, SassExt };
export type { BuildData, ConfigPreset, InitFn };