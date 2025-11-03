'use strict';

const js0 = require('js0');


class Tag {

    get html() {
        var html = '<' + this.name;
        for (var attribName in this.attribs)
            html += ' ' + attribName + '="' + this.attribs[attribName] + '"';

        if (this.content === null)
            html += ' />';
        else
            html += '>' + this.content + '</' + this.name + '>';

        return html;
    }


    constructor(name, attribs, content = null) {
        js0.args(arguments, 'string', 'object', [ 'string', js0.Default ]);

        this.name = name,
        this.attribs = JSON.parse(JSON.stringify(attribs));
        this.content = content;
    }

}
module.exports = Tag;
