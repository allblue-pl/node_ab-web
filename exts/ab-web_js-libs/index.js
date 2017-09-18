'use strict';

const fs = require('fs');

const abWeb = require('ab-web');


class abWeb_JSLibs extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);

    }


    __clean()
    {
        // abFS.deleteRecursiveSync(this.build);
    }

};
module.exports = abWeb_JSLibs;
