'use strict';

module.exports.init = function(conf, data) 
{
    conf.extArr(data['sass']['paths'], [
        '../dev/git/Font-Awesome/scss/brands.scss',
        '../dev/git/Font-Awesome/scss/regular.scss',
        '../dev/git/Font-Awesome/scss/solid.scss',
        '../dev/git/Font-Awesome/scss/fontawesome.scss',
    ]);

    conf.extArr(data['dist']['paths'], [
        '../dev/git/Font-Awesome/webfonts/**',
    ]);
}