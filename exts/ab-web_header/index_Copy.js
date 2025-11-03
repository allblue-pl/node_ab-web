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

    constructor(ab_web, ext_path) { super(ab_web, ext_path);
        this._exportHash = [];
        this._filePath = path.join(this.buildInfo.back, 'header.html');
        this._tagsGroups = new abWeb.Groups(this);
    }

    addTag(groupId, ...args) {
        if (!this._tagsGroups.has(groupId))
            this.addTagsGroup(groupId);

        let tag = new (Function.prototype.bind.apply(Tag, [ null ].concat(args)))();

        this._tagsGroups.addValue(groupId, tag);
        this.build();
    }

    addTagsGroup(groupId, props = {}) {
        this._tagsGroups.add(groupId, props);
    }

    clearTagsGroup(groupId) {
        this._tagsGroups.clear(groupId);
        this.build();
    }

    hasTagsGroup(groupId) {
        return this._tagsGroups.has(groupId);
    }

    getHtml() {
        var html = '';

        if (this._exportHash.includes('js')) {
            html += '<script>var ABWeb_Hash = "' + 
                    this.buildInfo.hash + '";</script>';
        }

        if (this._exportHash.includes('php')) {
            html += '<?php const ABWeb_Hash = "' + this.buildInfo.hash + '"; ?>';
        }

        /* Sort */
        let tagsGroups = this._tagsGroups.getValues();

        /* Html */
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }


    _compareSets(setA, setB) {
        if (setA.size !== setB.size)
            return false;

        for (let itemA of setA) {
            if (!setB.has(itemA))
                return false;
        }

        return true;
    }


    /* abWeb.Ext Overrides */
    __build(taskName) { let self = this;
        return new Promise((resolve, reject) => {
            self.console.info('Building...');

            if (!abFS.existsDirSync(path.dirname(this._filePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._filePath));

            fs.writeFile(this._filePath, this.getHtml(), (err) => {
                if (err !== null)
                    reject(err);

                self.console.success('Finished.');
                resolve();
            });
        });
    }

    __clean(taskName) { const self = this;
        return new Promise((resolve, reject) => {
            fs.unlink(self._filePath, (err, stat) => {
                if (err === null)
                    resolve();
                else if (err.code === 'ENOENT')
                    resolve();
                else
                    reject(err);
            });
        });
    }

    __parse(config) {
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
