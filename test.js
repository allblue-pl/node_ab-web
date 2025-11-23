'use strict';

const babel = require('@babel/core');

let script = babel.transform('"use strict";console.log("A");throw new Error("Test");console.log("B");', {
    presets: [ [require('@babel/preset-env'), {
        useBuiltIns: 'entry',
        corejs: 3.22,
    }], ],
    filename: 'test.js',
    sourceMaps: true,
    minified: true,
});

console.log(script);