import { abTSValidator } from "@allblue/ab-ts-parser";
import type Builder from "../../Builder.ts";
import Ext, { ExtPrinter } from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class TSValidatorExt extends Ext {
    #print_Errors: Array<string>;
    #projectFSPath: string;
    #tsconfigFSPath: string;

    constructor(builder: Builder) { 
        super(builder);

        this.#print_Errors = [];
        this.#projectFSPath = "";
        this.#tsconfigFSPath = "";
    }


    /* abWeb.Ext Overrides */
    async __build(): Promise<boolean> {
        this.#print_Errors = await abTSValidator.validateTSConfig_Async(
                this.#projectFSPath, this.#tsconfigFSPath);

        return true;
    }

    __getName(): string {
        return "ts-validator";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        this.build();

        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
        this.#print_Errors = [];

        if (config.project === undefined) {
            this.#print_Errors.push(`'project' not set in config.`);
            return false;
        }
        this.#projectFSPath = config.project;

        if (config.tsconfig === undefined) {
            this.#print_Errors.push(`'tsconfig' not set in config.`);
            return false;
        }
        this.#tsconfigFSPath = config.tsconfig;

        this.build();

        return true;
    }

    __printErrors(printer: ExtPrinter): void {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */

}
