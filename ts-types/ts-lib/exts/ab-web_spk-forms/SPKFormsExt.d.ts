import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
export default class SPKFormsExt extends Ext {
    #private;
    constructor(builder: Builder);
    __getName(): string;
    __parse_Pre(extConfig: object): boolean;
}
