import type Builder from "../../Builder.ts";
import ABWebExt from "../../ABWebExt.ts";
export default class SPKFormsExt extends ABWebExt {
    #private;
    constructor(builder: Builder);
    __getName(): string;
    __parse_Pre(extConfig: object): boolean;
}
