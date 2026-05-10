import type { ElemType } from "ab-xml-parser/lib/ts-types.js";
import type SpockyExt from "./SpockyExt.ts";
export default class LayoutBuilder {
    static Build(ext: SpockyExt, layoutPath: string, packagePath: string): void;
    static AddNode(parentLayoutNode: Array<any>, node: ElemType): void;
    static ParseFields(content: string): string[];
}
//# sourceMappingURL=LayoutBuilder.d.ts.map