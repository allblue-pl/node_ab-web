
export default class Tag {
    attribs                        ;
    content             ;
    name        ;


    get html()         {
        let html = '<' + this.name;
        for (let attribName in this.attribs)
            html += ' ' + attribName + '="' + this.attribs[attribName] + '"';

        if (this.content === null)
            html += ' />';
        else
            html += '>' + this.content + '</' + this.name + '>';

        return html;
    }


    constructor(name        , attribs                        , 
            content              = null) {
        this.name = name,
        this.attribs = JSON.parse(JSON.stringify(attribs));
        this.content = content;
    }

}
