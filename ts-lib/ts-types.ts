import type { WatchEventType } from "ab-fs-watcher/lib/ts-types.js";
import type BuildData from "./BuildData.ts";
import type Ext from "./Ext.ts";

export type BuildPreset = {
    config: ConfigPreset,
    init: Array<InitFn>,
    initDir: string,
    exts: Array<typeof Ext>
};

export type BuildType = "dev"|"rel";

export type ChalkColor = "cyan"|"green"|"red"|"yellow"|"redBright";

export type ChangeInfo = {
    "fsPath": string,
    "eventType": WatchEventType,
};

export type ChangeInfos = {[watcherName: string]: Array<ChangeInfo>};

export type ConfigPreset = {
    back: string;
    base: string;
    dev: string;
    dist: string;
    front: string;
    index: string;
    tmp: string;
};

export type ExtConfigPreset = {[key:string]: any};

export type GroupsInfos<ValueType> = {
    after: Array<string>;
    before: Array<string>;
    values: Array<ValueType>;
};

export type GroupsProps<ValueType> = {
    after?: Array<string>;
    before?: Array<string>;
    values: Array<ValueType>;
};

export type InitFn = (build: BuildData) => BuildData;

export type TaskArgs_OnChange = {
    "watcherName": string,
    "fsPath": string,
    "eventType": WatchEventType,
};

export type WatchEventTypes = WatchEventType;