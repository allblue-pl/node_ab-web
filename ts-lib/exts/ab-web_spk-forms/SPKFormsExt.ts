import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type SpockyExt from "../ab-web_spocky/SpockyExt.ts";

export default class SPKFormsExt extends Ext {
    #spocky: SpockyExt;

    constructor(builder: Builder) {
        super(builder);

        this.#spocky = this.uses("spocky") as SpockyExt;
    }


    override __getName(): string {
        return "spk-forms";
    }

    override __parse_Pre(extConfig: object): boolean {
        return true;
    }
}