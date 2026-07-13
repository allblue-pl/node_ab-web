                                            
import Ext, { ExtPrinter } from "../../Ext.js";
                                                                      

export default class TestExt extends Ext {
    #print_Errors               ;

    constructor(builder         ) { 
        super(builder);

        this.#print_Errors = [];
    }


    /* abWeb.Ext Overrides */
    async __build()                   {
        return true;
    }

    __getName()         {
        return "spocky";
    }

    __onChange(changeInfos             )          {
        console.log(changeInfos);
        return true;
    }

    __parse(config                 )          {
        if (!('packages' in config))
            return false;

        if (!('path' in config)) {
            this.#print_Errors.push('Spockies module path not set.');
            return false;
        }

        let packagePaths = [];
        for (let fsPath of config.packages) {
            // layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            packagePaths.push(fsPath);
        }

        this.watch('packages', [ 'add' ], packagePaths);

        console.log('Watching stuff?', this.getWatchedFSPatterns());

        return true;
    }

    __printErrors(printer            )       {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */
}