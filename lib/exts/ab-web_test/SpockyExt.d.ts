import Ext from "../../Ext.ts";
import type Builder from "../../Builder.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class SpockyExt extends Ext {
    #private;
    constructor(builder: Builder);
    __build(): Promise<boolean>;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
    __parse_Pre(config: ExtConfigPreset): boolean;
}
//# sourceMappingURL=SpockyExt.d.ts.map