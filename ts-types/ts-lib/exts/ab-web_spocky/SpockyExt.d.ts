import Ext, { ExtPrinter } from "../../Ext.ts";
import type Builder from "../../Builder.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class SpockyExt extends Ext {
    #private;
    constructor(builder: Builder);
    __build(): boolean;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
    __printErrors(printer: ExtPrinter): void;
}
