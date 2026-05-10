import type Ext from "./Ext.ts";
import type { GroupsProps } from "./ts-types.ts";
export default class Groups<ValueType> {
    #private;
    constructor(ext: Ext);
    add(groupId: string, props: GroupsProps<ValueType>): void;
    addValue(groupId: string, value: ValueType): void;
    clear(groupId: string): void;
    getGroup(groupId: string): ValueType[];
    getGroupIds(): string[];
    getValues(): Map<any, any>;
    getValues_AsArray(): Array<string>;
    has(groupId: string): boolean;
    removeValue(groupId: string, compareFn: (value: ValueType) => boolean): void;
}
//# sourceMappingURL=Groups.d.ts.map