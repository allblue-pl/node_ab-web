import path from "node:path";
import { Document } from "ab-xml-parser";
import fs from "node:fs";
import type { ElemType } from "ab-xml-parser/lib/ts-types.js";
import type SpockyExt from "./SpockyExt.ts";

export default class LayoutParser {
    static Parse(layoutPath: string): string {
        let layoutName = path.basename(layoutPath, '.html');
        
        let content = fs.readFileSync(layoutPath);
        let xmlDocument = new Document(content.toString());

        let layoutContent: Array<any> = [];
        for (let node of xmlDocument.nodes)
            LayoutParser.AddNode(layoutContent, node);

        let layoutContentString = JSON.stringify(layoutContent);
        let buildContent =
`import { type TS0RawObject } from "@allblue/ts0";;
import { Layout } from "spocky";

export default class ${layoutName} extends Layout {
    static get Content(): Array<any> {
        return ${layoutContentString};
    }

    constructor(defaultFieldValues: TS0RawObject = {}) {
        super(${layoutName}.Content, defaultFieldValues);
    }
}
`
        ;

        return buildContent.replaceAll("\n", "\r\n");
        // if (!fs.existsSync(buildDirPath))
        //     fs.mkdirSync(buildDirPath);
        // fs.writeFileSync(buildPath, buildContent);
    }

    static AddNode(parentLayoutNode: Array<any>, node: ElemType): void {
        if (node.type === 'text') {
            parentLayoutNode.push(node.value);
            return;
        } else if (node.type === 'comment') {
            /* To Do */ 
            return;
        } else if (node.type === 'element') {
            let lNode = [ node.name, node.attribs ];
            parentLayoutNode.push(lNode);

            let children = node.children;
            if (children !== undefined) {
                for (let childNode of children)
                    LayoutParser.AddNode(lNode, childNode);
            }
        }
    }

    static ParseFields(content: string): Array<string> {
        let lTextsArr = [];

        let regexpStrs_FieldName = '([a-zA-Z][a-zA-Z0-9._]*)+?(\\((.*)\\))?';
        let regexpStrs_Expression = '\\?\\(((.|\\s|\\S)+)\\)';

        regexpStrs_FieldName = '\\${?' + regexpStrs_FieldName + '}?';

        let r = new RegExp(`(${regexpStrs_FieldName})|(${regexpStrs_Expression})`, 'g');
        let offset = 0;
        while(true) {
            let match = r.exec(content);
            if (match === null)
                break;

            let text = content.substring(offset, match.index);
            if (text !== '')
                lTextsArr.push(text);

            if (typeof match[1] !== 'undefined') {
                let args = typeof match[3] === 'undefined' ? '' : match[3];
                lTextsArr.push(`$${match[2]}${args}`);    
            } else if (typeof match[5] !== 'undefined') {
                lTextsArr.push(match[5]);    
            } else
                throw new Error('Unknown match: ' + match[0]);

            offset = match.index + match[0].length;
        }

        let text = content.substring(offset);
        if (text !== '')
            lTextsArr.push(text);

        return lTextsArr;
    }
}