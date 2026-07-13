import { abTSValidator } from "@allblue/ab-ts-parser";
                                            
import Ext, { ExtPrinter } from "../../Ext.js";
                                                                      

export default class TSValidatorExt extends Ext {
    #print_Errors               ;
    #projectFSPath        ;
    #tsconfigFSPath        ;

    constructor(builder         ) { 
        super(builder);

        this.#print_Errors = [];
        this.#projectFSPath = "";
        this.#tsconfigFSPath = "";
    }


    /* abWeb.Ext Overrides */
    async __build()                   {
        this.#print_Errors = await abTSValidator.validateTSConfig_Async(
                this.#projectFSPath, this.#tsconfigFSPath);

        return true;
    }

    __getName()         {
        return "ts-validator";
    }

    __onChange(changeInfos             )          {
        this.build();

        return true;
    }

    __parse(config                 )          {
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

    __printErrors(printer            )       {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */

}
