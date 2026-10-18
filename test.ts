import LayoutParser from "./ts-lib/exts/ab-web_spocky/LayoutParser.ts";

let b = `
<div>
    a b              
    <span>    
    c </span>
</div>
`;

let l = new LayoutParser();

console.log(l.parseString("TestLayout", b));