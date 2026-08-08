import Builder from "./Builder.js";
                                                 

class abWeb_Class {
    constructor() {
    }

    exec(config             , buildType              = "dev", debug          = false)  
                 {
        let builder = new Builder(config, buildType, debug);
        builder.watch();
    }
}
const abWeb = new abWeb_Class();
export default abWeb;