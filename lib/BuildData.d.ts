import type BuildSettings from "./BuildSettings.ts";
import type { InitFn } from "./ts-types.ts";
export default class BuildData {
    #private;
    get settings(): BuildSettings;
    get data(): {
        [key: string]: any;
    };
    get devFSPath(): string;
    get initFSPath(): string;
    constructor(build: BuildSettings);
    ext(extFn: (buildSettings: BuildSettings, data: object, devPath: string) => void): BuildData;
    extArr(array: Array<any>, items: Array<any>): BuildData;
    extObj(object: object, items: object): BuildData;
    extendArray(array: Array<any>, items: Array<any>): BuildData;
    extendObject(object: {
        [key: string]: any;
    }, items: {
        [key: string]: any;
    }): BuildData;
    getData(): object;
    init(initFn: InitFn): BuildData;
}
//# sourceMappingURL=BuildData.d.ts.map