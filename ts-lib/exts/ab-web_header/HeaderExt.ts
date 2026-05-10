import path from "node:path";
import type Builder from "../../Builder.ts";
import Ext from "../../Ext.ts";
import Groups from "../../Groups.ts";
import type { ExtConfigPreset, GroupsProps } from "../../ts-types.ts";
import abFS from "ab-fs";
import fs from "node:fs";
import Tag from "./Tag.ts";

export default class HeaderExt extends Ext {
    #script_FilePath: string;

    #postBody_FilePath: string;
    #postBody_Scripts_FilePath: string;
    #postBody_Scripts_JSON: string;
    #postBody_ScriptUrisGroups: Groups<string>;
    #postBody_TagsGroups: Groups<Tag>;

    #header_FilePath: string;
    #header_Scripts_FilePath: string;
    #header_Scripts_JSON: string;
    #header_ScriptUrisGroups: Groups<string>;
    #header_TagsGroups: Groups<Tag>;

    #exportHash: Array<string>;

    constructor(builder:Builder) { 
        super(builder);

        let buildConfig = this.builder.settings.config;

        this.#script_FilePath = path.join(buildConfig.back, 'header.js');

        this.#postBody_FilePath = path.join(buildConfig.back, 'postBody.html');
        this.#postBody_Scripts_FilePath = path.join(buildConfig.back, 'postBody_Scripts.html');
        this.#postBody_Scripts_JSON = path.join(buildConfig.back, 'postBody.json');
        this.#postBody_ScriptUrisGroups = new Groups(this);
        this.#postBody_TagsGroups = new Groups(this);

        this.#header_FilePath = path.join(buildConfig.back, 'header.html');
        this.#header_Scripts_FilePath = path.join(buildConfig.back, 'header_Scripts.html');
        this.#header_Scripts_JSON = path.join(buildConfig.back, 'header.json');
        this.#header_ScriptUrisGroups = new Groups(this);
        this.#header_TagsGroups = new Groups(this);

        this.#exportHash = [];
    }

    addScriptUri_Header(groupId: string, scriptUri: string) {
        if (!this.#header_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this.#header_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addScriptUri_PostBody(groupId: string, scriptUri: string) {
        if (!this.#postBody_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this.#postBody_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addTag_PostBody(groupId: string, tagName: string, 
            tagAttribs: {[name:string]: string}) {
        if (!this.#postBody_TagsGroups.has(groupId))
            this.addTagsGroup_PostBody(groupId);

        let tag = new Tag(tagName, tagAttribs);

        this.#postBody_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTag_Header(groupId: string, tagName: string, 
            tagAttribs: {[name:string]: string}) {
        if (!this.#header_TagsGroups.has(groupId))
            this.addTagsGroup_Header(groupId);

        let tag = new Tag(tagName, tagAttribs);

        this.#header_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addScriptUrisGroup_Header(groupId: string, 
            props: GroupsProps<string> = { values: [] }) {
        this.#header_ScriptUrisGroups.add(groupId, props);
    }

    addScriptUrisGroup_PostBody(groupId: string, 
            props: GroupsProps<string> = { values: [] }) {
        this.#postBody_ScriptUrisGroups.add(groupId, props);
    }

    addTagsGroup_Header(groupId: string, props: GroupsProps<Tag> = { values: [] }) {
        this.#header_TagsGroups.add(groupId, props);
    }

    addTagsGroup_PostBody(groupId: string, props: GroupsProps<Tag> = { values: [] }) {
        this.#postBody_TagsGroups.add(groupId, props);
    }

    clearScriptUrisGroup_Header(groupId: string) {
        this.#header_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearScriptUrisGroup_PostBody(groupId: string) {
        this.#postBody_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_PostBody(groupId: string) {
        this.#postBody_TagsGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_Header(groupId: string) {
        this.#header_TagsGroups.clear(groupId);
        this.build();
    }

    hasScriptUrisGroup_Header(groupId: string) {
        return this.#header_ScriptUrisGroups.has(groupId);
    }

    hasScriptUrisGroup_PostBody(groupId: string) {
        return this.#postBody_ScriptUrisGroups.has(groupId);
    }

    hasTagsGroup_PostBody(groupId: string) {
        return this.#postBody_TagsGroups.has(groupId);
    }

    hasTagsGroup_Header(groupId: string) {
        return this.#header_TagsGroups.has(groupId);
    }

    getHtml_PostBody() {
        var html = '';

        /* Sort */
        let tagsGroups = this.#postBody_TagsGroups.getValues();

        /* Html */
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }

    getHtml_PostBody_Scripts() {
        var html = '';

        /* Sort */
        let groups = this.#postBody_ScriptUrisGroups.getValues();

        /* Html */
        for (let [ groupId, group ] of groups) {            
            html += `<!-- ${groupId} -->\r\n`;
            for (let scriptUri of group)
                html += `<script src="${scriptUri}"></script>\r\n`;
        }

        return html;
    }

    getHtml_Header() {
        let buildSettings = this.builder.settings;
        var html = '';

        if (!this.builder.isType('rel')) {
            if (this.#exportHash.includes('js')) {
                let scriptRelPath = path.relative(buildSettings.config.index, 
                        this.#script_FilePath)
                        .replace(/\\/g, '/');
                let scriptUri = buildSettings.config.base + scriptRelPath + '?v=' +
                        buildSettings.hash;
                html += `<script src="${scriptUri}"></script>`;
            }
        }

        if (this.#exportHash.includes('php')) {
            html += '<?php const ABWeb_Hash = "' + buildSettings.hash + '"; ?>';
        }

        /* Sort */
        let tagsGroups = this.#header_TagsGroups.getValues();

        /* Html */
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }

    getHtml_Header_Scripts() {
        var html = '';

        /* Sort */
        let groups = this.#header_ScriptUrisGroups.getValues();

        /* Html */
        for (let [ groupId, group ] of groups) {            
            html += `<!-- ${groupId} -->\r\n`;
            for (let scriptUri of group)
                html += `<script src="${scriptUri}"></script>\r\n`;
        }

        return html;
    }


    /* abWeb.Ext Overrides */
    __build(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.console.info('Building...');

            if (!abFS.existsDirSync(path.dirname(this.#postBody_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this.#postBody_FilePath));

            if (!abFS.existsDirSync(path.dirname(this.#header_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this.#header_FilePath));

            if (!abFS.existsDirSync(path.dirname(this.#script_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this.#script_FilePath));

            try {
                fs.writeFileSync(this.#header_FilePath, this.getHtml_Header());
                fs.writeFileSync(this.#header_Scripts_FilePath, 
                        this.getHtml_Header_Scripts());
                let json_Header = {
                    scriptUris: this.#header_ScriptUrisGroups.getValues_AsArray(),
                };
                fs.writeFileSync(this.#header_Scripts_JSON, 
                        JSON.stringify(json_Header));

                fs.writeFileSync(this.#postBody_FilePath, 
                        this.getHtml_PostBody());
                fs.writeFileSync(this.#postBody_Scripts_FilePath, 
                        this.getHtml_PostBody_Scripts());
                let json_PostBody = {
                    scriptUris: this.#postBody_ScriptUrisGroups.getValues_AsArray(),
                };
                fs.writeFileSync(this.#postBody_Scripts_JSON, 
                        JSON.stringify(json_PostBody));
            } catch (err) {
                reject(err);
                return;
            }

            if (this.builder.isType('rel')) {
                this.console.success('Finished.');
                resolve(true);
                return;
            } else {
                let script = '';
                if (this.#exportHash.includes('js'))
                    script += 'var ABWeb_Hash = "' + this.builder.settings.hash + '";';
                try {
                    fs.writeFileSync(this.#script_FilePath, script);
                } catch (err) {

                }
                
                this.console.success('Finished.');
                resolve(true);
                return;
            }
        });
    }

    // __clean(taskName) { const self = this;
    //     return new Promise((resolve, reject) => {
    //         fs.unlink(this._postBody_FilePath, (err, stat) => {
    //             let success = false;
    //             if (err === null) {
    //                 success = true;
    //             } else if (err.code === 'ENOENT') {
    //                 success = true;
    //             }
                
    //             if (!success) {
    //                 reject(err);
    //                 return;
    //             }

    //             fs.unlink(this._header_FilePath, (err, stat) => {
    //                 let success = false;
    //                 if (err === null) {
    //                     success = true;
    //                 } else if (err.code === 'ENOENT') {
    //                     success = true;
    //                 }
                    
    //                 if (!success) {
    //                     reject(err);
    //                     return;
    //                 }

    //                 fs.unlink(this._script_FilePath, (err, stat) => {
    //                     if (err === null)
    //                         resolve();
    //                     else if (err.code === 'ENOENT')
    //                         resolve();
    //                     else
    //                         reject(err);
    //                 });
    //             });
    //         });
    //     });
    // }

    __getName(): string {
        return "header";
    }

    __parse(config: ExtConfigPreset): boolean {
        this.#exportHash = config.exportHash;

        return true;
    }
    /* / abWeb.Ext Overrides */
}
