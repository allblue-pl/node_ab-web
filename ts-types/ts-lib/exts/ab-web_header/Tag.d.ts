export default class Tag {
    attribs: {
        [key: string]: string;
    };
    content: string | null;
    name: string;
    get html(): string;
    constructor(name: string, attribs: {
        [key: string]: string;
    }, content?: string | null);
}
