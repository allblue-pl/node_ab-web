import type { BuildPreset, InitFn } from "./ts-types.ts";
import ConfigSettings from "./ConfigSettings.ts";
import type ABWebExt from "./ABWebExt.ts";
export default class BuildSettings {
    #private;
    get config(): ConfigSettings;
    get exts(): Array<typeof ABWebExt>;
    get buildHash(): string;
    get initDir(): string;
    get initFns(): Array<InitFn>;
    get type(): "dev" | "rel";
    constructor(preset: BuildPreset, buildType: "dev" | "rel");
    refreshBuildHash(): void;
}
