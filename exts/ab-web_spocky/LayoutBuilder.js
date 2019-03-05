'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abXmlParser = require('ab-xml-parser')
;

class LayoutBuilder
{

    static Build(ext, layoutPath, packagePath)
    {
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
    spocky = require('spocky')
;

export default class ${layoutName} extends spocky.Layout {

    static get Content() {
        return ${layoutContentString};
    }


    constructor()
    {
        super(${layoutName}.Content);
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

    static AddNode(parentLayoutNode, node)
    {
        if (node.type === 'text') {
            let lTextsArr = LayoutBuilder.ParseFields(node.value);
            // console.log(lTextsArr);
            for (let lText of lTextsArr)
                parentLayoutNode.push(lText);
            return;
        } else if (node.type === 'comment') {
            /* To Do */ 
            return;
        } else if (node.type === 'element') {
            let attribs = {};
            for (let attribName in node.attribs)
                attribs[attribName] = LayoutBuilder.ParseFields(node.attribs[attribName]);

            let lNode = [ node.name, attribs ];
            parentLayoutNode.push(lNode);

            for (let childNode of node.children)
                LayoutBuilder.AddNode(lNode, childNode);
        }
    }

    static ParseFields(content)
    {
        let lTextsArr = [];

        let r = /\${?([a-zA-Z0-9._]+)}?(\(.*\))?/g;
        let offset = 0;
        while(true) {
            let match = r.exec(content);
            if (match === null)
                break;

            let text = content.substring(offset, match.index);
            if (text !== '')
                lTextsArr.push(text);

            let args = typeof match[2] === 'undefined' ? '' : match[2];
            lTextsArr.push(`$${match[1]}${args}`);
            offset = match.index + match[0].length;
        }

        let text = content.substring(offset);
        if (text !== '')
            lTextsArr.push(text);

        return lTextsArr;
    }

}
module.exports = LayoutBuilder;