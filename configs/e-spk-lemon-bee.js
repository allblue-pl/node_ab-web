'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['spocky']['packages'], [
        '../esite/packages/ecore/LemonBee/spk/spk-e-lemon-bee',
    ]);   
}