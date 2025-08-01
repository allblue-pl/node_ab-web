'use strict';

module.exports.init = function(conf, data)  {
    conf.extArr(data['js']['include'], [
        '../dev/node_modules/jquery/dist/jquery.min.js',
    ]);
}