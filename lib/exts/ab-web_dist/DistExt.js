import path from "node:path";
import Ext from "../../Ext.js";
import abFS from "ab-fs";
import fs from "node:fs";
export default class DistExt extends Ext {
    #path;
    constructor(builder) {
        super(builder);
        this.#path = builder.settings.config.dist;
    }
    /* abWeb.Ext Overrides */
    __getName() {
        return "dist";
    }
    __onChange(changeInfos) {
        for (let onChangeInfo of changeInfos.files) {
            let fsPath = onChangeInfo.fsPath;
            let fileRelPath = path.relative(path.join('..', 'dev'), fsPath);
            let distPath = path.join(this.#path, fileRelPath);
            let distDirPath = path.dirname(distPath);
            if (!fs.existsSync(distDirPath))
                abFS.mkdirRecursiveSync(distDirPath);
            fs.copyFile(fsPath, distPath, () => {
                this.console.log('Copied:', fileRelPath);
            });
        }
        return true;
    }
    __parse(config) {
        // if ('path' in config)
        //     this.#path = config.path;
        if (!this.builder.isType('rel'))
            return true;
        if (!('paths' in config))
            return false;
        this.watch('files', ['add', 'unlink', 'change'], config.paths);
        this.build();
        return true;
    }
}
