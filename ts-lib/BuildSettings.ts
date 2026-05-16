import path from "node:path";
import type { BuildPreset, InitFn } from "./ts-types.ts";
import ConfigSettings from "./ConfigSettings.ts";
import type Ext from "./Ext.ts";

export default class BuildSettings {
    #buildType: "dev"|"rel";
    #config: ConfigSettings;
    #hash: string;
    #preset: BuildPreset;


    get config(): ConfigSettings {
        return this.#config;
    }

    get exts(): Array<typeof Ext> {
        return this.#preset.exts;
    }

    get buildHash(): string {
        return this.#hash;
    }

    get initDir(): string {
        return this.#preset.initDir;
    }

    get initFns(): Array<InitFn> {
        return this.#preset.init;
    }

    get type(): "dev"|"rel" {
        return this.#buildType;
    }

    constructor(preset: BuildPreset, buildType: "dev"|"rel") {
        this.#buildType = buildType;
        this.#config = new ConfigSettings(preset.config, preset.initDir);
        this.#hash = this.#generateHash();
        this.#preset = preset;
    }

    refreshBuildHash(): void {
        this.#hash = this.#generateHash();
    }


    #generateHash(): string {
        let hash = '';

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                'abcdefghijklmnopqrstuvwxyz' + '0123456789';

        for (var i = 0; i < 16; i++)
            hash += chars.charAt(Math.floor(Math.random() * chars.length));

        return hash;
    }
}