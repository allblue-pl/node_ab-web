'use strict';

const fs = require('fs');
const path = require('path');

const abWeb = require('ab-web');

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

    addTag(group_id, ...args)
    {
        if (!this._tags.has(group_id))
            this._tags.set(group_id, []);

        let tags_group = this._tags.get(group_id);
        tags_group.push(new (Function.prototype.bind.apply(Tag,
                [ null ].concat(args)))());
    }

    addTagGroup(group_id, props = {})
    {
        if (!('before' in props)) {
            this._tags.set(group_id, []);
            return;
        }

        let new_tags = new Map();
        for (let [ t_group_id, group_tags ] of this._tags) {
            if (props.before.includes(t_group_id))
                new_tags.set(group_id, []);
            new_tags.set(group_id, group_tags);
        }
    }

    clearTags(group_id)
    {
        if (this._tags.has(group_id))
            this._tags.set(group_id, []);
    }


    _compareSets(set_a, set_b)
    {
        if (set_a.size !== set_b.size)
            return false;

        for (let item_a of set_a) {
            if (!set_b.has(item_a))
                return false;
        }

        return true;
    }

    _getHtml()
    {
        var html = '';
        for (let [ tags_group_id, tags_group ] of this._tags)
            for (let tag of tags_group)
                html += tag.html + '\r\n';

        return html;
    }


    /* abWeb.Ext Overrides */
    __build(task_name)
    { let self = this;
        return new Promise((resolve, reject) => {
            self.console.info('Building...');

            fs.writeFile(this._filePath, this._getHtml(), (err) => {
                if (err !== null)
                    reject(err);

                self.console.success('Finished.');
                resolve();
            });
        });
    }

    __clean(task_name)
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
