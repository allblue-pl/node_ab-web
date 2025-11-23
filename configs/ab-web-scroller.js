'use strict';

module.exports.init = function(conf, data, devPath)  {

    conf
        .init('jquery')
        .init('js0')
        .extendObject(data['js-libs'].libs, {
            'ab-web-scroller': devPath + '/node_modules/ab-web-scroller/js-lib',
        });
}