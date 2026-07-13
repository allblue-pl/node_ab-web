import type { Value } from "sass";
import type Ext from "./Ext.ts";
import type { GroupsInfos, GroupsProps } from "./ts-types.ts";
import { TS0List } from "@allblue/ts0";

export default class Groups<ValueType> {
    #ext: Ext;
    #groups: TS0List<string, GroupsInfos<ValueType>>;

    constructor(ext: Ext) {
        this.#ext = ext;
        this.#groups = new TS0List();
    }

    add(groupId: string, props: GroupsProps<ValueType>): void {
        if (!this.#groups.has(groupId))
            this.#groups.set(groupId, { values: [], before: [], after: [] });

        let group = this.#groups.get(groupId);

        if (props.before !== undefined)
            group.before = group.before.concat(props.before);

        if (props.after !== undefined)
            group.after = group.after.concat(props.after);
    }

    addValue(groupId: string, value: ValueType): void {
        let group = this.#groups.get(groupId);
        if (group === undefined)
            throw new Error(`Group '${groupId}' does not exist.`);

        group.values.push(value);
    }

    clear(groupId: string): void {
        let group = this.#groups.get(groupId);
        if (group === undefined)
            throw new Error(`Group '${groupId}' does not exist.`);

        group.values = [];
    }

    getGroup(groupId: string): Array<ValueType> {
        let group = this.#groups.get(groupId);
        if (group === undefined)
            throw new Error(`Group '${groupId}' does not exist.`);

        return group.values;
    }

    getGroupIds(): Array<string> {
        let groupIds = [];
        for (let [ groupId, _group ] of this.#groups)
            groupIds.push(groupId);

        return groupIds;
    }

    getValues(): Map<string, Array<ValueType>> {
        let sortedGroups: TS0List<string, GroupsInfos<ValueType>> = new TS0List();
        for (let [ groupId, group ] of this.#groups) {
            let insertIndex_Min = 0;
            let insertIndex_Max = sortedGroups.size;
            // console.log('Inserting', groupId);
            
            for (let i = 0; i < sortedGroups.size; i++) {
                if (sortedGroups.getAt(i).before.includes(groupId) ||
                        group.after.includes(sortedGroups.getKeyAt(i)))
                    insertIndex_Min = i + 1;
                
                if (sortedGroups.getAt(i).after.includes(groupId) ||
                        group.before.includes(sortedGroups.getKeyAt(i)))
                    insertIndex_Max = i;

                if (insertIndex_Min > insertIndex_Max)
                    throw new Error(`before/after inconsistency in group.`);
            }

            sortedGroups.addAt(insertIndex_Max, groupId, group);
        }

        let groupValues = new Map();
        for (let [ groupId, group ] of sortedGroups) {
            groupValues.set(groupId, group.values);
        }

        return groupValues;
    }

    getValues_AsArray(): Array<ValueType> {
        let valuesMap = this.getValues();
        let valuesArr = [];
        for (let [ groupId, groupValues] of valuesMap) {
            for (let i = 0; i < groupValues.length; i++)
                valuesArr.push(groupValues[i]);
        }

        return valuesArr;
    }

    has(groupId: string): boolean {
        return this.#groups.has(groupId);
    }

    removeValue(groupId: string, compareFn: (value: ValueType) => boolean): void {
        let groupValues = this.getGroup(groupId);
        for (let i = groupValues.length; i >= 0; i--) {
            if (compareFn(groupValues[i]))
                groupValues.splice(i, 1);
        }
    }
}