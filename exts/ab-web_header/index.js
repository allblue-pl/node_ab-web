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
        Object.defineProperties(this, {
            _filePath: { value: path.join(this.buildInfo.back, 'header.html'), },

            _tagsGroups: { value: new js0.List(), },
        });
    }

    addTag(groupId, ...args)
    {
        if (!this._tagsGroups.has(groupId))
            this.addTagGroup(groupId);

        let tagsGroup = this._tagsGroups.get(groupId);
        tagsGroup.tags.push(new (Function.prototype.bind.apply(Tag,
                [ null ].concat(args)))());
    }

    addTagGroup(groupId, props = {})
    {
        console.log('HM', groupId, props);

        if (this._tagsGroups.has(groupId))
            this.console.warn(`Tag group '${groupId}' already exists.`);
        else
            this._tagsGroups.set(groupId, { tags: [], before: [], after: [] });

        if ('before' in props) {
            this._tagsGroups.get(groupId).before = this._tagsGroups.get(groupId)
                    .before.concat(props.before);
        }

        if ('after' in props) {
            this._tagsGroups.get(groupId).after = this._tagsGroups.get(groupId)
                    .after.concat(props.after);
        }

        // if (!('before' in props)) {
        //     this._tagsGroups.set(groupId, []);
        //     return;
        // }

        // let newTags = new Map();
        // for (let [ t_groupId, groupTags ] of this._tags) {
        //     if (props.before.includes(t_groupId))
        //         newTags.set(groupId, []);
        //     newTags.set(groupId, groupTags);
        // }
    }

    clearTags(groupId)
    {
        if (this._tagsGroups.has(groupId))
            this._tagsGroups.get(groupId).tags = [];
    }

    getHtml()
    {
        /* Sort */
        let tagsGroups = new js0.List(this._tagsGroups);
        tagsGroups.sort((a, b) => {
            if (a.value.before.includes(b.key) || b.value.after.includes(a.key))
                return -1;
            if (b.value.before.includes(a.key) || a.value.after.includes(b.key))
                return 1;

            return 0;
        });

        /* Html */
        var html = '';
        for (let [ tagsGroupId, tagsGroup ] of tagsGroups) {            
            html += `<!-- ${tagsGroupId} -->\r\n`;
            for (let tag of tagsGroup.tags)
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
