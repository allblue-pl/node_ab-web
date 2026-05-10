import abFS from "ab-fs";
import fs from "node:fs";
import path from "node:path";
import * as dartSass from "sass";
import Ext from "../../Ext.js";
export default class SassExt extends Ext {
    #cssDir;
    #devPath;
    #distPath;
    #header;
    #remapPaths;
    #sourceDirPath;
    #sourcePath_Base;
    #sourcePath;
    #sources;
    #stylesPaths;
    #substyles;
    #variablesPaths;
    #variants;
    constructor(builder) {
        super(builder);
        let buildSettings = builder.settings;
        let buildConfig = buildSettings.config;
        this.#header = this.uses('header');
        this.#cssDir = path.join(buildConfig.front, 'css');
        if (!abFS.dir.existsSync(this.#cssDir)) {
            this.console.warn(`\`${this.#cssDir}\` does not exist. Creating...`);
            abFS.dir.createRecursiveSync(this.#cssDir);
        }
        let relDir = path.relative(buildConfig.index, buildConfig.front);
        this.#sourceDirPath = relDir;
        this.#sourcePath_Base = path.join(this.#cssDir, 'sass');
        this.#sourcePath = path.join(this.#cssDir, 'sass.css');
        this.#variablesPaths = [];
        this.#stylesPaths = [];
        this.#variants = [];
        this.#substyles = [];
        // this.#preloads = [];
        this.#sources = {};
        this.#devPath = path.relative(this.#cssDir, buildConfig.dev)
            .replace(/\\/g, '/');
        this.#distPath = path.relative(this.#cssDir, buildConfig.dist)
            .replace(/\\/g, '/');
        this.#remapPaths = [];
    }
    #createCss(css, sourceAlias) {
        let cssPath = path.join(this.#cssDir, sourceAlias === '_default' ?
            'sass.css' : `sass-${sourceAlias}.css`);
        let relativeCss = '';
        let regex = /url\(\s*([\'"])?(\{(.+?)\})+(.*?)([\'"])?\s*\)/gm;
        let regexIndex = 0;
        while (true) {
            let match = regex.exec(css);
            if (match === null)
                break;
            if (match.index <= regexIndex)
                continue;
            let open = typeof (match[1]) === 'undefined' ? '' : match[1];
            let close = typeof (match[5]) === 'undefined' ? '' : match[5];
            if (open !== close)
                continue;
            relativeCss += css.substring(regexIndex, match.index);
            if (match[4].match(/^(((https?:)?\/\/)|(data:))/)) {
                relativeCss += `url(${open}${match[4]}${close})`;
            }
            else {
                let relPath = match[3];
                if (this.builder.isType('rel')) {
                    if (match[3].indexOf(this.#devPath) === 0) {
                        relPath = this.#distPath +
                            match[3].substring(this.#devPath.length);
                    }
                    for (let remapPath of this.#remapPaths) {
                        if (match[3].indexOf(remapPath[0]) === 0) {
                            relPath = remapPath[1] + match[3].substring(remapPath[0].length);
                        }
                    }
                }
                let relation = path.join(relPath, match[4])
                    .replace(/\\/g, '/');
                relativeCss += `url(${open}${relation}${close})`;
                // this.#preloads.push(relation);
            }
            regexIndex = match.index + match[0].length;
        }
        relativeCss += css.substring(regexIndex, css.length);
        fs.writeFileSync(cssPath, relativeCss);
    }
    #getSources(fsPaths) {
        let sources = {
            '_default': '',
        };
        for (let variant of this.#variants) {
            sources[variant] = '';
        }
        for (let substyle of this.#substyles) {
            sources[substyle] = '';
        }
        this.console.log('Variables:');
        for (let fsPath of fsPaths.variables) {
            let relativePath = path.relative(this.#sourceDirPath, fsPath);
            relativePath = relativePath.replace(/\\/g, '/');
            sources['_default'] += '@import "{abWeb}' + relativePath + '";\r\n';
            for (let variant of this.#variants) {
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
            }
            this.console.log('    - ' + relativePath);
        }
        for (let variant of this.#variants) {
            this.console.log('Variant: ' + variant);
            for (let fsPath of fsPaths[`variants.${variant}.variables`]) {
                let relativePath = path.relative(this.#sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
                this.console.log('    - ' + relativePath);
            }
        }
        for (let substyle of this.#substyles) {
            this.console.log('Substyle: ' + substyle);
            for (let fsPath of fsPaths[`substyles.${substyle}.variables`]) {
                let relativePath = path.relative(this.#sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                sources[substyle] += '@import "{abWeb}' + relativePath + '";\r\n';
                this.console.log('    - ' + relativePath);
            }
        }
        // sassSource += '\r\n';
        this.console.log('Styles:');
        for (let fsPath of fsPaths.styles) {
            if (path.basename(fsPath) === 'variables.scss')
                continue;
            let relativePath = path.relative(this.#sourceDirPath, fsPath);
            relativePath = relativePath.replace(/\\/g, '/');
            if (path.extname(relativePath) === '.css')
                relativePath += '-abWeb';
            sources['_default'] += '@import "{abWeb}' + relativePath + '";\r\n';
            for (let variant of this.#variants) {
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
            }
            this.console.log('    - ' + relativePath);
        }
        for (let variant of this.#variants) {
            this.console.log('Variant: ' + variant);
            for (let fsPath of fsPaths[`variants.${variant}.styles`]) {
                if (path.basename(fsPath) === 'variables.scss')
                    continue;
                let relativePath = path.relative(this.#sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                if (path.extname(relativePath) === '.css')
                    relativePath += '-abWeb';
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
                this.console.log('    - ' + relativePath);
            }
        }
        for (let substyle of this.#substyles) {
            this.console.log('Variant: ' + substyle);
            for (let fsPath of fsPaths[`substyles.${substyle}.styles`]) {
                if (path.basename(fsPath) === 'variables.scss')
                    continue;
                let relativePath = path.relative(this.#sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                if (path.extname(relativePath) === '.css')
                    relativePath += '-abWeb';
                sources[substyle] += '@import "{abWeb}' + relativePath + '";\r\n';
                this.console.log('    - ' + relativePath);
            }
        }
        return sources;
    }
    #parseSource(url, prev, done) {
        if (url.indexOf('{abWeb}') === 0) {
            url = url.substring('{abWeb}'.length);
        }
        if (path.extname(url) === '.css-abWeb')
            url = url.substring(0, url.length - '-abWeb'.length);
        let urlPath = path.join(this.#sourceDirPath, url);
        if (path.extname(urlPath) !== '.scss' && path.extname(urlPath) !== '.css')
            urlPath += '.scss';
        let urlPath_Dir = path.dirname(urlPath);
        let urlPath_Base = path.basename(urlPath);
        if (!fs.existsSync(urlPath))
            urlPath = path.join(urlPath_Dir, '_' + urlPath_Base);
        if (!fs.existsSync(urlPath)) {
            this.console.error(`File '${url}' imported in '${prev}' does not exist.`);
            done({ contents: '' });
            return;
        }
        fs.readFile(urlPath, (err, data) => {
            if (err) {
                this.console.error('Cannot read file: ', url);
                done({ contents: '' });
                return;
            }
            let sass = data.toString();
            sass = sass.replace(/@import\s*([\'"])\s*/g, '@import $1' +
                path.dirname(url) + '/');
            let relativeSass = '';
            let regex = /url\(\s*([\'"])?(?!(?:https?:)?\/\/)(?!data:)(.*?)([\'"])?\s*\)/gm;
            let regexIndex = 0;
            while (true) {
                let match = regex.exec(sass);
                if (match === null)
                    break;
                if (match.index <= regexIndex)
                    continue;
                let open = typeof (match[1]) === 'undefined' ? '' : match[1];
                let close = typeof (match[3]) === 'undefined' ? '' : match[3];
                if (open !== close)
                    continue;
                relativeSass += sass.substring(regexIndex, match.index);
                // let relation = path.relative(this.cssDir, 
                //         path.dirname(urlPath)).replace(/\\/g, '/');
                let relation = path.relative(this.#cssDir, path.join(path.dirname(urlPath), match[2])).replace(/\\/g, '/');
                relativeSass += `url(${open}{${relation}}${close})`;
                regexIndex = match.index + match[0].length;
            }
            relativeSass += sass.substring(regexIndex, sass.length);
            done({ contents: relativeSass });
        });
    }
    /* abWeb.Ext Overrides */
    async __build() {
        let promises = [];
        for (let sourceAlias in this.#sources) {
            let sourcePath = sourceAlias === '_default' ?
                this.#sourcePath : (this.#sourcePath_Base + '-' +
                sourceAlias + '.css');
            promises.push(new Promise((resolve, reject) => {
                dartSass.render({
                    data: this.#sources[sourceAlias],
                    file: sourcePath,
                    includePaths: [this.#sourceDirPath],
                    importer: (url, prev, done) => {
                        return this.#parseSource(url, prev, done);
                    },
                    outputStyle: this.builder.isType('rel') ? 'compressed' : 'expanded',
                    silenceDeprecations: ['color-functions', 'global-builtin',
                        'if-function', 'import', 'legacy-js-api'],
                }, (err, result) => {
                    if (err) {
                        this.console.error('Error compiling sass.');
                        this.console.warn(err.toString());
                        this.console.warn('  File: ' + err.file);
                        this.console.warn('  Index: ' + err.column);
                        this.console.warn('  Line: ' + err.line);
                        resolve(false);
                        return;
                    }
                    if (result === undefined)
                        throw new Error("Sass render result is undefined.");
                    this.#createCss(result.css.toString('utf-8'), sourceAlias);
                    if (this.#header.hasTagsGroup_Header('preloads'))
                        this.#header.clearTagsGroup_Header('preloads');
                    resolve(true);
                });
            }));
        }
        let values = await Promise.all(promises);
        for (let value of values) {
            if (!value)
                return false;
        }
        this.#header.build();
        this.console.success('Finished.');
        return true;
    }
    __getName() {
        return "sass";
    }
    __onChange(changeInfos) {
        this.#sources = this.#getSources(this.getWatchedFSPaths());
        this.build();
        return true;
    }
    __parse(config) {
        if (!('paths' in config))
            return false;
        for (let remap of config.remaps) {
            this.#remapPaths.push([
                path.relative(this.#cssDir, remap[0])
                    .replace(/\\/g, '/'),
                path.relative(this.#cssDir, remap[1])
                    .replace(/\\/g, '/')
            ]);
        }
        if (config.addToHeader) {
            this.#header.addTag_Header('sass', 'link', {
                id: 'ABWeb_Sass_Styles',
                rel: "stylesheet",
                href: this.uri(this.#sourcePath, true),
                type: "text/css"
            });
            this.#header.addTagsGroup_Header('preloads', {
                'after': ['sass'],
                values: [],
            });
        }
        this.#variablesPaths = [];
        this.#stylesPaths = [];
        // this.#preloads = [];
        let watchPaths = [];
        for (let fsPath of config.paths) {
            if (path.extname(fsPath) === '.scss' || path.extname(fsPath) === '.css') {
                this.#stylesPaths.push(fsPath);
                watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
            }
            else if (path.extname(fsPath) === '') {
                this.#variablesPaths.push(path.join(fsPath, 'variables.scss'));
                this.#stylesPaths.push(path.join(fsPath, 'styles.scss'));
                watchPaths.push(path.join(fsPath, '*.*css'));
            }
            else
                this.console.error('Unknown extension type: ', fsPath);
        }
        for (let variant in config.variants) {
            this.#variants.push(variant);
            let variant_VariablePaths = [];
            let variant_StylePaths = [];
            for (let fsPath of config.variants[variant]) {
                if (path.extname(fsPath) === '.scss' ||
                    path.extname(fsPath) === '.css') {
                    variant_StylePaths.push(fsPath);
                    watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
                }
                else if (path.extname(fsPath) === '') {
                    variant_VariablePaths.push(path.join(fsPath, 'variables.scss'));
                    variant_StylePaths.push(path.join(fsPath, 'styles.scss'));
                    watchPaths.push(path.join(fsPath, '*.*css'));
                }
                else
                    this.console.error('Unknown extension type: ', fsPath);
            }
            this.watch(`variants.${variant}.variables`, ['add', 'unlink', 'change'], variant_VariablePaths);
            this.watch(`variants.${variant}.styles`, ['add', 'unlink', 'change'], variant_StylePaths);
        }
        for (let substyle in config.substyles) {
            this.#substyles.push(substyle);
            let substyle_VariablePaths = [];
            let substyle_StylePaths = [];
            for (let fsPath of config.substyles[substyle]) {
                if (path.extname(fsPath) === '.scss' ||
                    path.extname(fsPath) === '.css') {
                    substyle_StylePaths.push(fsPath);
                    watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
                }
                else if (path.extname(fsPath) === '') {
                    substyle_VariablePaths.push(path.join(fsPath, 'variables.scss'));
                    substyle_StylePaths.push(path.join(fsPath, 'styles.scss'));
                    watchPaths.push(path.join(fsPath, '*.*css'));
                }
                else
                    this.console.error('Unknown extension type: ', fsPath);
            }
            this.watch(`substyles.${substyle}.variables`, ['add', 'unlink', 'change'], substyle_VariablePaths);
            this.watch(`substyles.${substyle}.styles`, ['add', 'unlink', 'change'], substyle_StylePaths);
        }
        this.watch('scss', ['add', 'unlink', 'change'], watchPaths);
        this.watch('variables', ['add', 'unlink', 'change'], this.#variablesPaths);
        this.watch('styles', ['add', 'unlink', 'change'], this.#stylesPaths);
        this.build();
        return true;
    }
}
