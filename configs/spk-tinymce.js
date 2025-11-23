'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['dist'].paths, [
        devPath + '/node_modules/spk-tinymce/css/**',

        devPath + '/node_modules/tinymce/icons/**',
        devPath + '/node_modules/tinymce/plugins/**',
        devPath + '/node_modules/tinymce/skins/**',
        devPath + '/node_modules/tinymce/themes/**',
    ]);   

    conf.extArr(data['js'].compile, [
        devPath + '/node_modules/tinymce/tinymce.js',
    ]);

    conf.extArr(data['spocky'].packages, [
        devPath + '/node_modules/spk-tinymce',
    ]);   
}