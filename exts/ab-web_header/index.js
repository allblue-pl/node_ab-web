'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    abFS = require('ab-fs'),
    abWeb = require('../../.'),
    js0 = require('js0'),

    Tag = require('./Tag')
;
// const abFS = require('ab-fs');


class abWeb_Header extends abWeb.Ext {

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._script_FilePath = path.join(this.buildInfo.back, 'header.js');
        
        this._postBody_FilePath = path.join(this.buildInfo.back, 'postBody.html');
        this._postBody_Scripts_FilePath = path.join(this.buildInfo.back, 'postBody_Scripts.html');
        this._postBody_Scripts_JSON = path.join(this.buildInfo.back, 'postBody.json');
        this._postBody_ScriptUrisGroups = new abWeb.Groups(this);
        this._postBody_TagsGroups = new abWeb.Groups(this);

        this._header_FilePath = path.join(this.buildInfo.back, 'header.html');
        this._header_Scripts_FilePath = path.join(this.buildInfo.back, 'header_Scripts.html');
        this._header_Scripts_JSON = path.join(this.buildInfo.back, 'header.json');
        this._header_ScriptUrisGroups = new abWeb.Groups(this);
        this._header_TagsGroups = new abWeb.Groups(this);

        this._exportHash = [];
    }

    addScriptUri_Header(groupId, scriptUri)
    {
        js0.args(arguments, 'string', 'string');

        if (!this._header_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this._header_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addScriptUri_PostBody(groupId, scriptUri)
    {
        js0.args(arguments, 'string', 'string');

        if (!this._postBody_ScriptUrisGroups.has(groupId))
            this.addScriptUrisGroup_PostBody(groupId);

        this._postBody_ScriptUrisGroups.addValue(groupId, scriptUri);
        this.build();
    }

    addTag_PostBody(groupId, ...args)
    {
        js0.args(arguments, 'string', js0.ExtraArgs);

        if (!this._postBody_TagsGroups.has(groupId))
            this.addTagsGroup_PostBody(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._postBody_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTag_Header(groupId, ...args)
    {
        js0.args(arguments, 'string', js0.ExtraArgs);

        if (!this._header_TagsGroups.has(groupId))
            this.addTagsGroup_Header(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._header_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addScriptUrisGroup_Header(groupId, props = {})
    {
        js0.args(arguments, 'string', [ js0.RawObject, js0.Default ]);

        this._header_ScriptUrisGroups.add(groupId, props);
    }

    addScriptUrisGroup_PostBody(groupId, props = {})
    {
        js0.args(arguments, 'string', [ js0.RawObject, js0.Default ]);

        this._postBody_ScriptUrisGroups.add(groupId, props);
    }

    addTagsGroup_Header(groupId, props = {})
    {
        js0.args(arguments, 'string', [ js0.RawObject, js0.Default ]);

        this._header_TagsGroups.add(groupId, props);
    }

    addTagsGroup_PostBody(groupId, props = {})
    {
        js0.args(arguments, 'string', [ js0.RawObject, js0.Default ]);

        this._postBody_TagsGroups.add(groupId, props);
    }

    clearScriptUrisGroup_Header(groupId)
    {
        js0.args(arguments, 'string');

        this._header_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearScriptUrisGroup_PostBody(groupId)
    {
        js0.args(arguments, 'string');

        this._postBody_ScriptUrisGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_PostBody(groupId)
    {
        js0.args(arguments, 'string');

        this._postBody_TagsGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_Header(groupId)
    {
        js0.args(arguments, 'string');

        this._header_TagsGroups.clear(groupId);
        this.build();
    }

    hasScriptUrisGroup_Header(groupId)
    {
        js0.args(arguments, 'string');

        return this._header_ScriptUrisGroups.has(groupId);
    }

    hasScriptUrisGroup_PostBody(groupId)
    {
        js0.args(arguments, 'string');

        return this._postBody_ScriptUrisGroups.has(groupId);
    }

    hasTagsGroup_PostBody(groupId)
    {
        js0.args(arguments, 'string');

        return this._postBody_TagsGroups.has(groupId);
    }

    hasTagsGroup_Header(groupId)
    {
        js0.args(arguments, 'string');

        return this._header_TagsGroups.has(groupId);
    }

    getHtml_PostBody()
    {
        var html = '';

        /* Sort */
        let tagsGroups = this._postBody_TagsGroups.getValues();

        /* Html */
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }

    getHtml_PostBody_Scripts()
    {
        var html = '';

        /* Sort */
        let groups = this._postBody_ScriptUrisGroups.getValues();

        /* Html */
        for (let [ groupId, group ] of groups) {            
            html += `<!-- ${groupId} -->\r\n`;
            for (let scriptUri of group)
                html += `<script src="${scriptUri}"></script>\r\n`;
        }

        return html;
    }

    getHtml_Header()
    {
        var html = '';

        if (!this.buildInfo.type('rel')) {
            if (this._exportHash.includes('js')) {
                let scriptRelPath = path.relative(this.buildInfo.index, this._script_FilePath)
                        .replace(/\\/g, '/');
                let scriptUri = this.buildInfo.base + scriptRelPath + '?v=' +
                        this.buildInfo.hash;
                html += `<script src="${scriptUri}"></script>`;
            }
        }

        if (this._exportHash.includes('php')) {
            html += '<?php const ABWeb_Hash = "' + this.buildInfo.hash + '"; ?>';
        }

        /* Sort */
        let tagsGroups = this._header_TagsGroups.getValues();

        /* Html */
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }

    getHtml_Header_Scripts()
    {
        var html = '';

        /* Sort */
        let groups = this._header_ScriptUrisGroups.getValues();

        /* Html */
        for (let [ groupId, group ] of groups) {            
            html += `<!-- ${groupId} -->\r\n`;
            for (let scriptUri of group)
                html += `<script src="${scriptUri}"></script>\r\n`;
        }

        return html;
    }


    _compareSets(setA, setB)
    {
        if (setA.size !== setB.size)
            return false;

        for (let itemA of setA) {
            if (!setB.has(itemA))
                return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(taskName)
    { let self = this;
        return new Promise((resolve, reject) => {
            self.console.info('Building...');

            if (!abFS.existsDirSync(path.dirname(this._postBody_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._postBody_FilePath));

            if (!abFS.existsDirSync(path.dirname(this._header_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._header_FilePath));

            if (!abFS.existsDirSync(path.dirname(this._script_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._script_FilePath));

            try {
                fs.writeFileSync(this._header_FilePath, this.getHtml_Header());
                fs.writeFileSync(this._header_Scripts_FilePath, 
                        this.getHtml_Header_Scripts());
                let json_Header = {
                    scriptUris: this._header_ScriptUrisGroups.getValues_AsArray(),
                };
                fs.writeFileSync(this._header_Scripts_JSON, 
                        JSON.stringify(json_Header));

                fs.writeFileSync(this._postBody_FilePath, 
                        this.getHtml_PostBody());
                fs.writeFileSync(this._postBody_Scripts_FilePath, 
                        this.getHtml_PostBody_Scripts());
                let json_PostBody = {
                    scriptUris: this._postBody_ScriptUrisGroups.getValues_AsArray(),
                };
                fs.writeFileSync(this._postBody_Scripts_JSON, 
                        JSON.stringify(json_PostBody));
            } catch (err) {
                reject(err);
                return;
            }

            if (this.buildInfo.type('rel')) {
                self.console.success('Finished.');
                resolve();
                return;
            } else {
                let script = '';
                if (this._exportHash.includes('js'))
                    script += 'var ABWeb_Hash = "' + this.buildInfo.hash + '";';
                try {
                    fs.writeFileSync(this._script_FilePath, script);
                } catch (err) {

                }
                
                self.console.success('Finished.');
                resolve();
                return;
            }
        });
    }

    __clean(taskName)
    { const self = this;
        return new Promise((resolve, reject) => {
            fs.unlink(self._postBody_FilePath, (err, stat) => {
                let success = false;
                if (err === null) {
                    success = true;
                } else if (err.code === 'ENOENT') {
                    success = true;
                }
                
                if (!success) {
                    reject(err);
                    return;
                }

                fs.unlink(self._header_FilePath, (err, stat) => {
                    let success = false;
                    if (err === null) {
                        success = true;
                    } else if (err.code === 'ENOENT') {
                        success = true;
                    }
                    
                    if (!success) {
                        reject(err);
                        return;
                    }

                    fs.unlink(self._script_FilePath, (err, stat) => {
                        if (err === null)
                            resolve();
                        else if (err.code === 'ENOENT')
                            resolve();
                        else
                            reject(err);
                    });
                });
            });
        });
    }

    __parse(config)
    {
        this._exportHash = config.exportHash;

        // abWeb.types.conf(config, {
        //     'paths':  {
        //         required: false,
        //         type: 'array',
        //     },
        // });

        // if ('paths' in config)
        //     this.watch('files', config.paths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Header;
