import type Builder from "../../Builder.ts";
import ABWebExt, { ExtPrinter } from "../../ABWebExt.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class CopyExt extends ABWebExt {
    #private;
    constructor(builder: Builder);
    __build(): boolean;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
    __parse_Pre(config: ExtConfigPreset): boolean;
    __printLogs(printer: ExtPrinter): void;
}
