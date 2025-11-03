'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abXmlParser = require('ab-xml-parser')
;

class LayoutBuilder {

    static Build(ext, layoutPath, packagePath) {
        let layoutName = path.basename(layoutPath, '.html');
        let buildDirPath = path.join(packagePath, 'js-lib/$layouts');
        let buildPath = path.join(buildDirPath, path.basename(layoutPath, 
                '.html') + '.js');
        
        let content = fs.readFileSync(layoutPath);
        let xmlDocument = new abXmlParser.Document(content.toString());

        let layoutContent = [];
        for (let node of xmlDocument.nodes)
            LayoutBuilder.AddNode(layoutContent, node);

        let layoutContentString = JSON.stringify(layoutContent);
        let buildContent =
`'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky')
;

export default class ${layoutName} extends spocky.Layout {

    static get Content() {
        return ${layoutContentString};
    }


    constructor(defaultFieldValues = {}) {
        js0.args(arguments, [ js0.RawObject, js0.Default ]);

        super(${layoutName}.Content, defaultFieldValues);
    }

}
`
        ;

        if (!fs.existsSync(buildDirPath)) {
            ext.console.log(`Creating layouts dir: '${buildDirPath}'.`)
            fs.mkdirSync(buildDirPath);
        }
        fs.writeFileSync(buildPath, buildContent);
    }

    static AddNode(parentLayoutNode, node) {
        if (node.type === 'text') {
            parentLayoutNode.push(node.value);
            return;
        } else if (node.type === 'comment') {
            /* To Do */ 
            return;
        } else if (node.type === 'element') {
            let lNode = [ node.name, node.attribs ];
            parentLayoutNode.push(lNode);

            for (let childNode of node.children)
                LayoutBuilder.AddNode(lNode, childNode);
        }
    }

    static ParseFields(content) {
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
module.exports = LayoutBuilder;