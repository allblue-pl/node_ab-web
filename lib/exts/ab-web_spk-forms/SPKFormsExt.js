                                            
import Ext from "../../Ext.js";
                                                           

export default class SPKFormsExt extends Ext {
    #spocky           ;

    constructor(builder         ) {
        super(builder);

        this.#spocky = this.uses("spocky")             ;
    }


             __getName()         {
        return "spk-forms";
    }

             __parse_Pre(extConfig        )          {
        return true;
    }
}