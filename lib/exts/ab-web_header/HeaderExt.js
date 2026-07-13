import path from "node:path";
                                            
import Ext from "../../Ext.js";
import Groups from "../../Groups.js";
                                                                      
import abFS from "ab-fs";
import fs from "node:fs";
import Tag from "./Tag.js";

export default class HeaderExt extends Ext {
    #script_FilePath        ;

    #postBody_FilePath        ;
    #postBody_Scripts_FilePath        ;
    #postBody_Scripts_JSON        ;
    #postBody_ScriptUrisGroups                ;
    #postBody_TagsGroups             ;

    #header_FilePath        ;
    #header_Scripts_FilePath        ;
    #header_Scripts_JSON        ;
    #header_ScriptUrisGroups                ;
    #header_TagsGroups             ;

    #exportHash               ;

    constructor(builder        ) { 
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

    addScriptUri_Header(groupId        , scriptUri        )       {
        if (!this.#header_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this.#header_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addScriptUri_PostBody(groupId        , scriptUri        )       {
        if (!this.#postBody_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this.#postBody_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addTag_PostBody(groupId        , tagName        , 
            tagAttribs                         )       {
        if (!this.#postBody_TagsGroups.has(groupId))
            this.addTagsGroup_PostBody(groupId);

        let tag = new Tag(tagName, tagAttribs);

        this.#postBody_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTag_Header(groupId        , tagName        , 
            tagAttribs                         )       {
        if (!this.#header_TagsGroups.has(groupId))
            this.addTagsGroup_Header(groupId);

        let tag = new Tag(tagName, tagAttribs);

        this.#header_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addScriptUrisGroup_Header(groupId        , 
            props                      = { values: [] })       {
        this.#header_ScriptUrisGroups.add(groupId, props);
    }

    addScriptUrisGroup_PostBody(groupId        , 
            props                      = { values: [] })       {
        this.#postBody_ScriptUrisGroups.add(groupId, props);
    }

    addTagsGroup_Header(groupId        , props                   = { values: [] })       {
        this.#header_TagsGroups.add(groupId, props);
    }

    addTagsGroup_PostBody(groupId        , props                   = { values: [] })       {
        this.#postBody_TagsGroups.add(groupId, props);
    }

    clearScriptUrisGroup_Header(groupId        )       {
        this.#header_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearScriptUrisGroup_PostBody(groupId        )       {
        this.#postBody_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_PostBody(groupId        )       {
        this.#postBody_TagsGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_Header(groupId        )       {
        this.#header_TagsGroups.clear(groupId);
        this.build();
    }

    hasScriptUrisGroup_Header(groupId        )          {
        return this.#header_ScriptUrisGroups.has(groupId);
    }

    hasScriptUrisGroup_PostBody(groupId        )          {
        return this.#postBody_ScriptUrisGroups.has(groupId);
    }

    hasTagsGroup_PostBody(groupId        )          {
        return this.#postBody_TagsGroups.has(groupId);
    }

    hasTagsGroup_Header(groupId        )          {
        return this.#header_TagsGroups.has(groupId);
    }

    getHtml_PostBody()         {
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

    getHtml_PostBody_Scripts()         {
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

    getHtml_Header()         {
        let buildSettings = this.builder.settings;
        var html = '';

        if (!this.builder.isType('rel')) {
            if (this.#exportHash.includes('js')) {
                let scriptRelPath = path.relative(buildSettings.config.index, 
                        this.#script_FilePath)
                        .replace(/\\/g, '/');
                let scriptUri = buildSettings.config.base + scriptRelPath + '?v=' +
                        buildSettings.buildHash;
                html += `<script src="${scriptUri}"></script>`;
            }
        }

        if (this.#exportHash.includes('php')) {
            html += '<?php const ABWeb_Hash = "' + buildSettings.buildHash + '"; ?>';
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

    getHtml_Header_Scripts()         {
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

    removeScriptUri_PostBody(groupId        , scriptUri        )       {
        this.#postBody_ScriptUrisGroups.removeValue(groupId, (value) => {
            return scriptUri === value;
        });
    }


    /* abWeb.Ext Overrides */
    __build()                   {
        return new Promise((resolve, reject) => {
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
                resolve(true);
                return;
            } else {
                let script = '';
                if (this.#exportHash.includes('js'))
                    script += 'var ABWeb_Hash = "' + this.builder.settings.buildHash + '";';
                try {
                    fs.writeFileSync(this.#script_FilePath, script);
                } catch (err) {

                }
                
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

    __getName()         {
        return "header";
    }

    __parse(config                 )          {
        this.#exportHash = config.exportHash;

        return true;
    }
    /* / abWeb.Ext Overrides */
}
