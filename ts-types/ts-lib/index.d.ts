import type { BuildPreset } from "./ts-types.ts";
declare class abWeb_Class {
    constructor();
    exec(config: BuildPreset, buildType?: "dev" | "rel", debug?: boolean): void;
}
declare const abWeb: abWeb_Class;
export default abWeb;
