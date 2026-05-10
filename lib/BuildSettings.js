import path from "node:path";
import ConfigSettings from "./ConfigSettings.js";
export default class BuildSettings {
    #buildType;
    #config;
    #hash;
    #preset;
    get config() {
        return this.#config;
    }
    get exts() {
        return this.#preset.exts;
    }
    get hash() {
        return this.#hash;
    }
    get initDir() {
        return this.#preset.initDir;
    }
    get initFns() {
        return this.#preset.init;
    }
    get type() {
        return this.#buildType;
    }
    constructor(preset, buildType) {
        this.#buildType = buildType;
        this.#config = new ConfigSettings(preset.config, preset.initDir);
        this.#hash = this.#generateHash();
        this.#preset = preset;
    }
    #generateHash() {
        let hash = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz' + '0123456789';
        for (var i = 0; i < 16; i++)
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        return hash;
    }
}
