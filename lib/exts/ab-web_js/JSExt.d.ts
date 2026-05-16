import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import Groups from "../../Groups.ts";
import type { ChangeInfos, ExtConfigPreset, GroupsProps } from "../../ts-types.ts";
export default class JSExt extends Ext {
    #private;
    constructor(builder: Builder);
    addScript(groupId: string, scriptPath: string, type?: "compile" | "include"): void;
    addScript_Compile(groupId: string, scriptPath: string): void;
    addScript_Include(groupId: string, scriptPath: string): void;
    addScriptsGroup(groupId: string, props?: GroupsProps<string>, type?: "compile" | "include"): void;
    buildHeader(): void;
    clearScriptsGroup(groupId: string, type?: "compile" | "include"): void;
    getScriptsGroups(type: "compile" | "include"): Groups<string>;
    removeScript(groupId: string, scriptPath: string, type?: "compile" | "include"): void;
    __build(): boolean;
    __getName(): string;
    __onChange(changeInfos: ChangeInfos): boolean;
    __parse(config: ExtConfigPreset): boolean;
}
//# sourceMappingURL=JSExt.d.ts.map