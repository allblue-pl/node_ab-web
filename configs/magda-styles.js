'use strict';

module.exports.init = (conf, data) => {
    conf.extendArray(data['sass'].paths, [
        '../dev/node_modules/magda-styles/scss',
    ]);
}