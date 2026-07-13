import type Builder from "../../Builder.ts";
import Ext, { ExtPrinter } from "../../Ext.ts";
import { type LibInfo } from "./ts-types.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
import { JSLibsBuilder } from "js-libs";
export default class JSLibsExt extends Ext {
    #private;
    get buildFSPath(): string;
    get libBuilder(): JSLibsBuilder;
    constructor(builder: Builder);
    addLib(libName: string, libFSPath: string, libType: "ts" | "js", tsconfigFSPath?: string | null, legacyJS?: boolean): void;
    getLibInfo(libName: string): LibInfo;
    __build(): Promise<boolean>;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
    __printErrors(printer: ExtPrinter): void;
    __printLogs(printer: ExtPrinter): void;
}
