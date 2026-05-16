import Ext from "../../Ext.js";
export default class TextExt extends Ext {
    constructor(builder) {
        super(builder);
    }
    /* abWeb.Ext Overrides */
    async __build() {
        return true;
    }
    __getName() {
        return "spocky";
    }
    __onChange(changeInfos) {
        console.log(changeInfos);
        return true;
    }
    __parse(config) {
        if (!('packages' in config))
            return false;
        if (!('path' in config)) {
            this.console.error('Spockies module path not set.');
            return false;
        }
        let packagePaths = [];
        for (let fsPath of config.packages) {
            // layoutPaths.push(path.join(fsPath, 'layouts/*.html'));
            packagePaths.push(fsPath);
        }
        this.watch('packages', ['add'], packagePaths);
        console.log('Watching stuff?', this.getWatchedFSPatterns());
        return true;
    }
}
