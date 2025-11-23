'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['js']['include'], [
        devPath + '/node_modules/jquery/dist/jquery.min.js',
    ]);
}