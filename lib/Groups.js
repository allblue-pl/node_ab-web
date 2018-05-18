'use strict';

const
    js0 = require('js0')
;

class Groups
{

    constructor()
    {
        this._groups = new js0.List();
    }

    add(groupId, props = {})
    {
        js0.args(arguments, 'string', [ js0.Preset({
            before: [ Array, js0.Default ],
            after: [ Array, js0.Default ], 
        }), js0.Default ]);

        if (this._groups.has(groupId))
            this.console.warn(`Tag group '${groupId}' already exists.`);
        else
            this._groups.set(groupId, { values: [], before: [], after: [] });

        if ('before' in props) {
            this._groups.get(groupId).before = this._groups.get(groupId)
                    .before.concat(props.before);
        }

        if ('after' in props) {
            this._groups.get(groupId).after = this._groups.get(groupId)
                    .after.concat(props.after);
        }
    }

    addValue(groupId, value)
    {
        if (!this.has(groupId))
            throw new Error(`Group '${groupId}' does not exist.`);

        this._groups.get(groupId).values.push(value);
    }

    clear(groupId)
    {
        if (!this.has(groupId))
            throw new Error(`Group '${groupId}' does not exist.`);

        this._groups.get(groupId).values = [];
    }

    getGroup(groupId)
    {
        if (!this.has(groupId))
        throw new Error(`Group '${groupId}' does not exist.`);

        return this._groups.get(groupId).values;
    }

    getGroupIds()
    {
        let groupIds = [];
        for (let [ groupId, group ] of this._groups)
            groupIds.push(groupId);

        return groupIds;
    }

    getValues()
    {
        let sortedGroups = new js0.List(this._groups);
        sortedGroups.sort((a, b) => {
            if (a.value.before.includes(b.key) || b.value.after.includes(a.key))
                return -1;
            if (b.value.before.includes(a.key) || a.value.after.includes(b.key))
                return 1;

            return 0;
        });

        let groupValues = new Map();
        for (let [ groupId, group ] of sortedGroups) {
            groupValues.set(groupId, group.values);
        }

        return groupValues;
    }

    has(groupId)
    {
        return this._groups.has(groupId);
    }

    remove(groupId)
    {
        if (this._groups.has(groupId))
            this._groups.get(groupId).tags = [];
    }

}
module.exports = Groups;