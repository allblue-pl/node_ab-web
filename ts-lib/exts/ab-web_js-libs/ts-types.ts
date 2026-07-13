import ts0, { type TS0ValueType } from "@allblue/ts0";
import type { WatchEventType } from "ab-fs-watcher/lib/ts-types.js";

export type LibInfo = {
    type: "js",
    libName: string,
    libFSPath: string,
    tsconfigFSPath: null,
} | {
    type: "ts",
    libName: string,
    libFSPath: string,
    tsconfigFSPath: string|null,
}

export type ScriptInfo = {
    libName: string,
    scriptFSPath: string,
    eventTypes: Array<WatchEventType>,
};

export type JSPkgInfos = Array<{
    libs: {[libName: string]: string},
}>
export const presets_JSPkgInfos: TS0ValueType = ts0.TArray(ts0.TPreset({
    libs: ts0.TObject("string", "string"),
}));

export type TSPkgInfos = Array<{
    tsconfig: string|null,
    libs: {[libName: string]: string},
}>
export const presets_TSPkgInfos: TS0ValueType = ts0.TArray(ts0.TPreset({
    tsconfig: [ "string", ts0.TNull ],
    libs: ts0.TObject("string", "string"),
}));