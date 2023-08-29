'use strict';

module.exports.init = function(conf, data) 
{

    conf
        .init('jquery')
        .init('js0')
        .extendObject(data['js-libs'].libs, {
            'ab-web-scroller': '../dev/node_modules/ab-web-scroller/js-lib',
        });
}