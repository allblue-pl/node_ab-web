import type Builder from "../../Builder.ts";
import ABWebExt, { ExtPrinter } from "../../ABWebExt.ts";
import type { ChangeInfos, ExtConfigPreset } from "../../ts-types.ts";

export default class TestExt extends ABWebExt {
    #print_Errors: Array<string>;

    constructor(builder: Builder) { 
        super(builder);

        this.#print_Errors = [];
    }


    /* abWeb.Ext Overrides */
    override async __build(): Promise<boolean> {
        return true;
    }

    __getName(): string {
        return "spocky";
    }

    override __onChange(changeInfos: ChangeInfos): boolean {
        console.log(changeInfos);
        return true;
    }

    override __parse(config: ExtConfigPreset): boolean {
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

    override __printErrors(printer: ExtPrinter): void {
        for (let error of this.#print_Errors)
            printer.error(error);
    }
    /* / abWeb.Ext Overrides */
}