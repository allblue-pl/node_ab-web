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
        this._exportHash = [];
        this._body_FilePath = path.join(this.buildInfo.back, 'body.html');
        this._header_FilePath = path.join(this.buildInfo.back, 'header.html');
        this._header_TagsGroups = new abWeb.Groups(this);
        this._body_TagsGroups = new abWeb.Groups(this);
    }

    addTag_Body(groupId, ...args)
    {
        if (!this._body_TagsGroups.has(groupId))
            this.addTagsGroup_Body(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._body_TagsGroups.addValue(groupId, tag);
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

    addTagsGroup_Body(groupId, props = {})
    {
        this._body_TagsGroups.add(groupId, props);
    }

    addTagsGroup_Header(groupId, props = {})
    {
        this._header_TagsGroups.add(groupId, props);
    }

    clearTagsGroup_Body(groupId)
    {
        this._body_TagsGroups.clear(groupId);
        this.build();
    }

    clearTagsGroup_Header(groupId)
    {
        this._header_TagsGroups.clear(groupId);
        this.build();
    }

    hasTagsGroup_Body(groupId)
    {
        return this._body_TagsGroups.has(groupId);
    }

    hasTagsGroup_Header(groupId)
    {
        return this._header_TagsGroups.has(groupId);
    }

    getHtml_Body()
    {
        var html = '';

        /* Sort */
        let tagsGroups = this._body_TagsGroups.getValues();

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

        if (this._exportHash.includes('js')) {
            html += '<script>var ABWeb_Hash = "' + 
                    this.buildInfo.hash + '";</script>';
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

            if (!abFS.existsDirSync(path.dirname(this._body_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._body_FilePath));

            if (!abFS.existsDirSync(path.dirname(this._header_FilePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._header_FilePath));

            fs.writeFile(this._body_FilePath, this.getHtml_Body(), (err) => {
                if (err !== null) {
                    reject(err);
                    return;
                }

                fs.writeFile(this._header_FilePath, this.getHtml_Header(), (err) => {
                    if (err !== null) {
                        reject(err);
                        return;
                    }

                    self.console.success('Finished.');
                    resolve();
                    return;
                });
            });
        });
    }

    __clean(taskName)
    { const self = this;
        return new Promise((resolve, reject) => {
            fs.unlink(self._body_FilePath, (err, stat) => {
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
                    if (err === null)
                        resolve();
                    else if (err.code === 'ENOENT')
                        resolve();
                    else
                        reject(err);
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
