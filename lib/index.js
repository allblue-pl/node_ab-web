import Builder from "./Builder.js";
class abWeb_Class {
    constructor() {
    }
    exec(config, buildType = "dev") {
        let builder = new Builder(config, buildType);
        builder.watch();
    }
}
const abWeb = new abWeb_Class();
export default abWeb;
