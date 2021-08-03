'use strict';

module.exports.init = function(conf, data) 
{
    conf.extArr(data['dist'].paths, [
        '../dev/node_modules/spk-tinymce/css/**',

        '../dev/node_modules/tinymce/plugins/**',
        '../dev/node_modules/tinymce/skins/**',
        '../dev/node_modules/tinymce/themes/**',
    ]);   

    conf.extArr(data['js'].compile, [
        '../dev/node_modules/tinymce/tinymce.js',
    ]);

    conf.extArr(data['spocky'].packages, [
        '../dev/node_modules/spk-tinymce',
    ]);   
}