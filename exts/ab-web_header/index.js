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


class abWeb_Header extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._script_FilePath = path.join(this.buildInfo.back, 'header.js');
        
        this._postBody_FilePath = path.join(this.buildInfo.back, 'postBody.html');
        this._postBody_JSON = path.join(this.buildInfo.back, 'postBody.json');
        this._postBody_ScriptUris = [];
        this._postBody_TagsGroups = new abWeb.Groups(this);

        this._header_FilePath = path.join(this.buildInfo.back, 'header.html');
        this._header_JSON = path.join(this.buildInfo.back, 'header.json');
        this._header_ScriptUris = [];
        this._header_TagsGroups = new abWeb.Groups(this);

        this._exportHash = [];
    }

    addScriptUri_Header(scriptUri)
    {
        this._header_ScriptUris.push(scriptUri);
    }

    addScriptUri_PostBody(scriptUri)
    {
        this._postBody_ScriptUris.push(scriptUri);
    }

    addTag_PostBody(groupId, ...args)
    {
        if (!this._postBody_TagsGroups.has(groupId))
            this.addTagsGroup_PostBody(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._postBody_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTag_Header(groupId, ...args)
    {
        if (!this._header_TagsGroups.has(groupId))
            this.addTagsGroup_Header(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._header_TagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTagsGroup_PostBody(groupId, props = {})
    {
        this._postBody_TagsGroups.add(groupId, props);
    }

    addTagsGroup_Header(groupId, props = {})
    {
        this._header_TagsGroups.add(groupId, props);
    }

    clearTagsGroup_PostBody(groupId)
    {
        this._postBody_TagsGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_Header(groupId)
    {
        this._header_TagsGroups.clear(groupId);
        this.build();
    }

    hasTagsGroup_PostBody(groupId)
    {
        return this._postBody_TagsGroups.has(groupId);
    }

    hasTagsGroup_Header(groupId)
    {
        return this._header_TagsGroups.has(groupId);
    }

    getHtml_PostBodyInit()
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
                let json_Header = {
                    scriptUris: this._header_ScriptUris,
                };
                fs.writeFileSync(this._header_JSON, 
                        JSON.stringify(json_Header));

                fs.writeFileSync(this._postBody_FilePath, 
                        this.getHtml_PostBodyInit());
                let json_PostBody = {
                    scriptUris: this._postBody_ScriptUris,
                };
                fs.writeFileSync(this._postBody_JSON, 
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
