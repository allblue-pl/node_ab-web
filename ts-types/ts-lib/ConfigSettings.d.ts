import type { ConfigPreset } from "./ts-types.ts";
export default class ConfigSettings {
    #private;
    get back(): string;
    get base(): string;
    get configFSPath(): string;
    get dev(): string;
    get dist(): string;
    get front(): string;
    get index(): string;
    get tmp(): string;
    constructor(config: ConfigPreset, configFSPath: string);
}
