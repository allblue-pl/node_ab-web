'use strict';

module.exports.init = function(conf, data)  {
    conf
        .init('jquery')
        .extArr(data['sass']['paths'], [
            '../dev/node_modules/blueimp-gallery/css/blueimp-gallery.min.css',
        ])
        .extArr(data['js']['include'], [
            '../dev/node_modules/blueimp-gallery/js/blueimp-gallery.min.js',
            '../dev/node_modules/ab-gallery/js/ab-gallery.js',
        ])
        .extArr(data['dist']['paths'], [
            '../dev/node_modules/blueimp-gallery/img/**',
        ]);
}