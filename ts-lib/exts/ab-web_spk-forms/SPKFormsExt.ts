import type Builder from "../../Builder.ts";
import ABWebExt from "../../ABWebExt.ts";
import type SpockyExt from "../ab-web_spocky/SpockyExt.ts";

export default class SPKFormsExt extends ABWebExt {
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