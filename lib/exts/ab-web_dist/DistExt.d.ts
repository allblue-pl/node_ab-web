import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class DistExt extends Ext {
    #private;
    constructor(builder: Builder);
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
}
//# sourceMappingURL=DistExt.d.ts.map