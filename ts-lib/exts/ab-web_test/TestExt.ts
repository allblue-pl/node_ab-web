import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class TextExt extends Ext {
    constructor(builder: Builder) { 
        super(builder);
    }


    /* abWeb.Ext Overrides */
    async __build(): Promise<boolean> {
        return true;
    }

    __getName(): string {
        return "spocky";
    }

    __onChange(changeInfos: ChangeInfos): boolean {
        console.log(changeInfos);
        return true;
    }

    __parse(config: ExtConfigPreset): boolean {
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

        this.watch('packages', [ 'add' ], packagePaths);

        console.log('Watching stuff?', this.getWatchedFSPatterns());

        return true;
    }
    /* / abWeb.Ext Overrides */
}