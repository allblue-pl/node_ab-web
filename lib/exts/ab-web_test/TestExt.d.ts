import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class TextExt extends Ext {
    constructor(builder: Builder);
    __build(): Promise<boolean>;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
}
//# sourceMappingURL=TestExt.d.ts.map