import Builder from "./Builder.ts";
import type { BuildPreset } from "./ts-types.ts";

class abWeb_Class {
    constructor() {
    }

    exec(config: BuildPreset, buildType: "dev"|"rel" = "dev", debug: boolean = false): 
            void {
        let builder = new Builder(config, buildType, debug);
        builder.watch();
    }
}
const abWeb = new abWeb_Class();
export default abWeb;