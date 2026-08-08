export default class LayoutParser {
    #private;
    static ParseFields(content: string): Array<string>;
    constructor();
    parse(layoutPath: string): string;
    parseString(layoutName: string, layoutStr: string): string;
}
