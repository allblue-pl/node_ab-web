'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf
        .init('jquery')
        .extArr(data['sass']['paths'], [
            devPath + '/node_modules/blueimp-gallery/css/blueimp-gallery.min.css',
        ])
        .extArr(data['js']['include'], [
            devPath + '/node_modules/blueimp-gallery/js/blueimp-gallery.min.js',
            devPath + '/node_modules/ab-gallery/js/ab-gallery.js',
        ])
        .extArr(data['dist']['paths'], [
            devPath + '/node_modules/blueimp-gallery/img/**',
        ]);
}