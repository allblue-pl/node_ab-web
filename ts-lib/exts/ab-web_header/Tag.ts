
export default class Tag {
    attribs: {[key:string]: string};
    content: string|null;
    name: string;


    get html(): string {
        let html = '<' + this.name;
        for (let attribName in this.attribs)
            html += ' ' + attribName + '="' + this.attribs[attribName] + '"';

        if (this.content === null)
            html += ' />';
        else
            html += '>' + this.content + '</' + this.name + '>';

        return html;
    }


    constructor(name: string, attribs: {[key:string]: string}, 
            content: string|null = null) {
        this.name = name,
        this.attribs = JSON.parse(JSON.stringify(attribs));
        this.content = content;
    }

}
