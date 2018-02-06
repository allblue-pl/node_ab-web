'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');

const Tag = require('./Tag');
// const abFS = require('ab-fs');


class abWeb_Header extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        Object.defineProperties(this, {
            _filePath: { value: path.join(this.buildInfo.back, 'header.html'), },

            _tags: { value: new Map(), },
        })

    }

    addTag(groupId, ...args)
    {
        if (!this._tags.has(groupId))
            this._tags.set(groupId, []);

        let tagsGroup = this._tags.get(groupId);
        tagsGroup.push(new (Function.prototype.bind.apply(Tag,
                [ null ].concat(args)))());
    }

    addTagGroup(groupId, props = {})
    {
        if (!('before' in props)) {
            this._tags.set(groupId, []);
            return;
        }

        let newTags = new Map();
        for (let [ t_groupId, groupTags ] of this._tags) {
            if (props.before.includes(t_groupId))
                newTags.set(groupId, []);
            newTags.set(groupId, groupTags);
        }
    }

    clearTags(groupId)
    {
        if (this._tags.has(groupId))
            this._tags.set(groupId, []);
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

    _getHtml()
    {
        var html = '';
        for (let [ tagsGroupId, tagsGroup ] of this._tags) {
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup)
                html += tag.html + '\r\n';
        }

        return html;
    }


    /* abWeb.Ext Overrides */
    __build(taskName)
    { let self = this;
        return new Promise((resolve, reject) => {
            self.console.info('Building...');

            if (!abFS.existsDirSync(path.dirname(this._filePath)))
                abFS.mkdirRecursiveSync(path.dirname(this._filePath));

            fs.writeFile(this._filePath, this._getHtml(), (err) => {
                if (err !== null)
                    reject(err);

                self.console.success('Finished.');
                resolve();
            });
        });
    }

    __clean(taskName)
    { const self = this;
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

    __parse(config)
    {
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
