'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abXmlParser = require('ab-xml-parser')
;

class LayoutBuilder
{

    static Build(layoutPath)
    {
        let layoutPathArr = path.basename(layoutPath, '.html').split('.');
        let buildPath = path.join(path.dirname(layoutPath), 
                path.basename(layoutPath, '.html') + '.js');
        
        let packagePath = layoutPathArr[0];
        let layoutName = layoutPathArr[1];
        
        let content = fs.readFileSync(layoutPath);
        let xmlDocument = new abXmlParser.Document(content.toString());
        
        let layoutContent = [];
        for (let node of xmlDocument.nodes)
            LayoutBuilder.AddNode(layoutContent, node);

        let layoutContentString = JSON.stringify(layoutContent);
        let buildContent =
`'use strict';

spocky.package('${packagePath}', ($app, $pkg) => {
    Object.defineProperty($pkg.$layouts, '${layoutName}', {
        value: class ${layoutName}Layout extends spocky.Layout {

            constructor()
            {
                super(${layoutContentString});
            }

        }, enumerable: true,
    });
});
`
        ;

        fs.writeFileSync(buildPath, buildContent);
    }

    static AddNode(parentLayoutNode, node)
    {
        if (node.type === 'text') {
            let lTextsArr = LayoutBuilder.ParseContent(node.value);
            // console.log(lTextsArr);
            for (let lText of lTextsArr)
                parentLayoutNode.push(lText);
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

    static ParseContent(content)
    {
        let lTextsArr = [];

        let r = /\$[a-zA-Z0-9._]+/g;
        let offset = 0;
        while(true) {
            let match = r.exec(content);
            if (match === null)
                break;

            let text = content.substring(offset, match.index);
            if (text !== '')
                lTextsArr.push(text);

            lTextsArr.push(match[0]);
            offset = match.index + match[0].length;
        }

        let text = content.substring(offset);
        if (text !== '')
            lTextsArr.push(text);

        return lTextsArr;
    }

}
module.exports = LayoutBuilder;