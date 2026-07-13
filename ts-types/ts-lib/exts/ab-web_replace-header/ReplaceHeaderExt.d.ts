import Ext, { ExtPrinter } from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
import type Builder from "../../Builder.ts";
export default class ReplaceHeaderExt extends Ext {
    #private;
    constructor(builder: Builder);
    __build(): Promise<boolean>;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
    __printErrors(printer: ExtPrinter): void;
    __printLogs(printer: ExtPrinter): void;
}
