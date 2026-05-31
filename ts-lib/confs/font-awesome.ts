import type BuildData from "../BuildData.ts";

export default (build: BuildData): BuildData => {
    return build
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/git/Font-Awesome/scss/brands.scss',
            build.devFSPath + '/git/Font-Awesome/scss/regular.scss',
            build.devFSPath + '/git/Font-Awesome/scss/solid.scss',
            build.devFSPath + '/git/Font-Awesome/scss/fontawesome.scss',
        ])
        .extArr(build.data['dist']['paths'], [
            build.devFSPath + '/git/Font-Awesome/webfonts/**',
        ]);
}                                                                                                                                                                                                            