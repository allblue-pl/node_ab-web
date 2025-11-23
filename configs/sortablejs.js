'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['js']['include'], [
        devPath + '/node_modules/sortablejs/Sortable.js',
    ]);
}