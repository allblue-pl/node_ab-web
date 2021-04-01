'use strict';

module.exports.init = function(conf, data) 
{
    conf.extendArray(data['sass']['paths'], [
        '../dev/git/Font-Awesome/web-fonts-with-css/scss/brands.scss',
        '../dev/git/Font-Awesome/web-fonts-with-css/scss/regular.scss',
        '../dev/git/Font-Awesome/web-fonts-with-css/scss/solid.scss',
        '../dev/git/Font-Awesome/web-fonts-with-css/scss/fontawesome.scss',
    ]);

    conf.extendArray(data['dist']['paths'], [
        '../dev/git/Font-Awesome/webfonts/**',
    ]);
}