import abConfs from "./lib/ab-confs.js"
import abWeb from "./lib/index.js";
import CopyExt from "./lib/exts/ab-web_copy/CopyExt.js";
import DistExt from "./lib/exts/ab-web_dist/DistExt.js";
import HeaderExt from "./lib/exts/ab-web_header/HeaderExt.js";
import JSExt from "./lib/exts/ab-web_js/JSExt.js";
import JSLibsExt from "./lib/exts/ab-web_js-libs/JSLibsExt.js";
import SassExt from "./lib/exts/ab-web_sass/SassExt.js";
import SpockyExt from "./lib/exts/ab-web_spocky/SpockyExt.js";
import TestExt from "./lib/exts/ab-web_test/TestExt.js";

export default abWeb;
export { abConfs }
export { CopyExt, DistExt, HeaderExt, JSExt, JSLibsExt, SassExt, SpockyExt, TestExt };