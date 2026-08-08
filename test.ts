import LayoutParser from "./ts-lib/exts/ab-web_spocky/LayoutParser.ts";

let b = `
<spk-form-field _hide="isNew" form="TestForm" name="_Id" type="Text"
        label="$abText('Sys:Forms_Id_Label')"
        div-class="row mt-3"
        label-class="col-xl-2 col-lg-4 control-label"
        field-class="col-xl-10 col-lg-8" />

$TestA : $TestB

<div _field="TestC" />

<$ _repeat="A:B">
    $B
</$>
`;

let l = new LayoutParser();

console.log(l.parseString("TestLayout", b));