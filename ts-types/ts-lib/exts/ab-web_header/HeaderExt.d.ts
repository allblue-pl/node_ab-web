import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import type { ExtConfigPreset, GroupsProps } from "../../ts-types.ts";
import Tag from "./Tag.ts";
export default class HeaderExt extends Ext {
    #private;
    constructor(builder: Builder);
    addScriptUri_Header(groupId: string, scriptUri: string): void;
    addScriptUri_PostBody(groupId: string, scriptUri: string): void;
    addTag_PostBody(groupId: string, tagName: string, tagAttribs: {
        [name: string]: string;
    }): void;
    addTag_Header(groupId: string, tagName: string, tagAttribs: {
        [name: string]: string;
    }): void;
    addScriptUrisGroup_Header(groupId: string, props?: GroupsProps<string>): void;
    addScriptUrisGroup_PostBody(groupId: string, props?: GroupsProps<string>): void;
    addTagsGroup_Header(groupId: string, props?: GroupsProps<Tag>): void;
    addTagsGroup_PostBody(groupId: string, props?: GroupsProps<Tag>): void;
    clearScriptUrisGroup_Header(groupId: string): void;
    clearScriptUrisGroup_PostBody(groupId: string): void;
    clearTagsGroup_PostBody(groupId: string): void;
    clearTagsGroup_Header(groupId: string): void;
    hasScriptUrisGroup_Header(groupId: string): boolean;
    hasScriptUrisGroup_PostBody(groupId: string): boolean;
    hasTagsGroup_PostBody(groupId: string): boolean;
    hasTagsGroup_Header(groupId: string): boolean;
    getHtml_PostBody(): string;
    getHtml_PostBody_Scripts(): string;
    getHtml_Header(): string;
    getHtml_Header_Scripts(): string;
    removeScriptUri_PostBody(groupId: string, scriptUri: string): void;
    __build(): Promise<boolean>;
    __getName(): string;
    __parse(config: ExtConfigPreset): boolean;
}
