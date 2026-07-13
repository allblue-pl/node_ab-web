import type { ElemType } from "ab-xml-parser/lib/ts-types.js";
export default class LayoutParser {
    static Parse(layoutPath: string): string;
    static AddNode(parentLayoutNode: Array<any>, node: ElemType): void;
    static ParseFields(content: string): Array<string>;
}
