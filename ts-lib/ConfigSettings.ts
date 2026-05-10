import path from "node:path";
import type { ConfigPreset } from "./ts-types.ts";

export default class ConfigSettings {
    #config: ConfigPreset;
    #configFSPath: string;

    get back(): string {
        return path.resolve(this.#config.back);
    }

    get base(): string {
        return this.#config.base;
    }

    get configFSPath(): string {
        return this.#configFSPath;
    }

    get dev(): string {
        return path.resolve(this.#config.dev);
    }

    get dist(): string {
        return path.resolve(this.#config.dist);
    }

    get front(): string {
        return path.resolve(this.#config.front);
    }

    get index(): string {
        return path.resolve(this.#config.index);
    }

    get tmp(): string {
        return path.resolve(this.#config.tmp);
    }


    constructor(config: ConfigPreset, configFSPath: string) {
        this.#config = config;
        this.#configFSPath = configFSPath;
    }
}