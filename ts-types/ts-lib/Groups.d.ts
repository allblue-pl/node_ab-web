import type Ext from "./Ext.ts";
import type { GroupsProps } from "./ts-types.ts";
export default class Groups<ValueType> {
    #private;
    constructor(ext: Ext);
    add(groupId: string, props: GroupsProps<ValueType>): void;
    addValue(groupId: string, value: ValueType): void;
    clear(groupId: string): void;
    getGroup(groupId: string): Array<ValueType>;
    getGroupIds(): Array<string>;
    getValues(): Map<string, Array<ValueType>>;
    getValues_AsArray(): Array<ValueType>;
    has(groupId: string): boolean;
    removeValue(groupId: string, compareFn: (value: ValueType) => boolean): void;
}
