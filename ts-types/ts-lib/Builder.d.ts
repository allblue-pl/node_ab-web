import { Tasker } from "ab-tasks";
import BuildSettings from "./BuildSettings.ts";
import type Ext from "./Ext.ts";
import type { BuildPreset, BuildType } from "./ts-types.ts";
export default class Builder {
    #private;
    get settings(): BuildSettings;
    get _tasker(): Tasker;
    constructor(buildPreset: BuildPreset, buildType: "dev" | "rel", debug?: boolean);
    build(): void;
    buildEnd(): void;
    isType(buildType: BuildType): boolean;
    usesExt(extClass: typeof Ext): boolean;
    watch(): void;
    _getExt(extName: string): Ext | null;
}
