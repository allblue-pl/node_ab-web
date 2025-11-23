'use strict';

module.exports.init = function(conf, data, devPath)  {
    conf.extArr(data['sass']['paths'], [
        devPath + '/git/Font-Awesome/scss/brands.scss',
        devPath + '/git/Font-Awesome/scss/regular.scss',
        devPath + '/git/Font-Awesome/scss/solid.scss',
        devPath + '/git/Font-Awesome/scss/fontawesome.scss',
    ]);

    conf.extArr(data['dist']['paths'], [
        devPath + '/git/Font-Awesome/webfonts/**',
    ]);
}