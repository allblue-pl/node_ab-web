import type { BuildPreset, InitFn } from "./ts-types.ts";
import ConfigSettings from "./ConfigSettings.ts";
import type Ext from "./Ext.ts";
export default class BuildSettings {
    #private;
    get config(): ConfigSettings;
    get exts(): Array<typeof Ext>;
    get buildHash(): string;
    get initDir(): string;
    get initFns(): Array<InitFn>;
    get type(): "dev" | "rel";
    constructor(preset: BuildPreset, buildType: "dev" | "rel");
    refreshBuildHash(): void;
}
//# sourceMappingURL=BuildSettings.d.ts.map