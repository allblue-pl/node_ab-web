import { Task } from "ab-tasks";
import type Builder from "./Builder.ts";
import type { ChalkColor, ChangeInfos } from "./ts-types.ts";
import type { WatchEventType } from "ab-fs-watcher/lib/ts-types.js";
export default abstract class Ext {
    #private;
    get builder(): Builder;
    get name(): string;
    get _tasks_Build(): Task<undefined>;
    constructor(builder: Builder);
    afterBuild(listener: () => void): void;
    build(): void;
    clean(): void;
    clearDebug(): void;
    debug(...messages: Array<any>): void;
    getWatchedFSPaths(): {
        [key: string]: Array<string>;
    };
    getWatchedFSPatterns(): {
        [key: string]: Array<string>;
    };
    init(): void;
    printDebug(): void;
    printLogs(): void;
    printErrors(): void;
    unwatch(watcherName: string): void;
    uri(fsPath: string, addHash?: boolean, error?: string | null): string;
    uses(extName: string): Ext;
    watch(watcherName: string, eventTypes: Array<WatchEventType>, pathPatterns: Array<string>): void;
    __build(): boolean | Promise<boolean>;
    __clean(): boolean | Promise<boolean>;
    __onChange(changeInfos: ChangeInfos): boolean;
    __onInit(): void;
    __parse(extConfig: object): boolean;
    __parse_Pre(extConfig: object): boolean;
    __printLogs(printer: ExtPrinter): void;
    __printErrors(printer: ExtPrinter): void;
    abstract __getName(): string;
}
export declare class ExtPrinter {
    #private;
    constructor(ext: Ext);
    color(color: ChalkColor, ...args: Array<string>): void;
    debug(...args: Array<any>): void;
    error(...args: Array<string>): void;
    info(...args: Array<string>): void;
    log(...args: Array<string>): void;
    success(...args: Array<string>): void;
    warn(...args: Array<string>): void;
}
