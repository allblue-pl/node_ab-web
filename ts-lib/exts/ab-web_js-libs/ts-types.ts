import type { WatchEventType } from "ab-fs-watcher/lib/ts-types.js";

export type ScriptInfo = {
    "libName": string,
    "scriptPath": string,
    "eventType": WatchEventType,
};