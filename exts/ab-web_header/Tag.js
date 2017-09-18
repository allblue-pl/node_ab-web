'use strict';

const abTypes = require('ab-types');


class Tag
{

    get html() {
        var html = '<' + this.name;
        for (var attrib_name in this.attribs)
            html += ' ' + attrib_name + '="' + this.attribs[attrib_name] + '"';

        if (this.content === null)
            html += ' />';
        else
            html += '>' + this.content + '</' + this.name + '>' + "\r\n";

        return html;
    }


    constructor(name, attribs, content = null)
    {
        abTypes.args(arguments, 'string', 'object', 'string');

        this.name = name,
        this.attribs = JSON.parse(JSON.stringify(attribs));
        this.content = content;
    }

}
module.exports = Tag;
