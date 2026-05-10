import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";
export default class JSLibsExt extends Ext {
    #private;
    constructor(builder: Builder);
    addLib(libName: string, libPath: string): void;
    __build(): Promise<boolean>;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
}
//# sourceMappingURL=JSLibsExt.d.ts.map