'use strict';

module.exports.init = function(conf, data) 
{
    conf.init('jquery');

    conf.extendArray(data['sass']['paths'], [
        '../dev/node_modules/blueimp-gallery/css/blueimp-gallery.min.css',
    ]);

    conf.extendArray(data['js']['include'], [
        '../dev/node_modules/blueimp-gallery/js/blueimp-gallery.min.js',
        '../dev/node_modules/ab-gallery/js/ab-gallery.js',
    ]);
}