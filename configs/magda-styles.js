'use strict';

module.exports.init = (conf, data) => {
    conf.extArr(data['sass'].paths, [
        '../dev/node_modules/magda-styles/scss',
    ]);
}