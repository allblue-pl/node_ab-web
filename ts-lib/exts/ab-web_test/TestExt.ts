import type Builder from "../../Builder.ts";
import Ext, { ExtPrinter } from "../../Ext.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class TestExt extends Ext {
    #print_Errors: Array<string>;

    constructor(builder: Builder) { 
        super(builder);

        this.#print_Errors = [];
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

    __printErrors(printer: ExtPrinter): void {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */
}