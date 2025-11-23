'use strict';

module.exports.init = (conf, data) => {
    conf.extArr(data['sass'].paths, [
        devPath + '/node_modules/magda-styles/scss',
    ]);
}