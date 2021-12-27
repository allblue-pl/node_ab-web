'use strict';

const 
    fs = require('fs'),
    path = require('path'),

    abFS = require('ab-fs'),
    dartSass = require('sass'),

    abWeb = require('../../.')
;
// const nodeSass = require('node-sass');


class abWeb_Sass extends abWeb.Ext
{

    constructor(abWeb, extPath)
    { super(abWeb, extPath);
        this._header = this.uses('header');

        this.cssDir = path.join(this.buildInfo.front, 'css');
        if (!abFS.dir.existsSync(this.cssDir)) {
            this.console.warn(`\`${this.cssDir}\` does not exist. Creating...`);
            abFS.dir.createRecursiveSync(this.cssDir);
        }

        let relDir = path.relative(this.buildInfo.index, this.buildInfo.front);
        this._sourceDirPath = relDir;
        this._sourcePath_Base = path.join(this.cssDir, 'sass');
        this._sourcePath = path.join(this.cssDir, 'sass.css');

        this._variablesPaths = [];
        this._stylesPaths = [];
        this._variants = [];
        this._substyles = [];
        // this._preloads = [];

        this._devPath = path.relative(this.cssDir, this.buildInfo.dev)
                .replace(/\\/g, '/', '/');
        this._distPath = path.relative(this.cssDir, this.buildInfo.dist)
                .replace(/\\/g, '/', '/');
    }


    _createCss(css, sourceAlias)
    {
        let cssPath = path.join(this.cssDir, sourceAlias === '_default' ?
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

            let open = typeof(match[1]) === 'undefined' ? '' : match[1];
            let close = typeof(match[5]) === 'undefined' ? '' : match[5];

            if (open !== close)
                continue;

            relativeCss += css.substring(regexIndex, match.index); 

            if (match[4].match(/^(((https?:)?\/\/)|(data:))/)) {
                relativeCss += `url(${open}${match[4]}${close})`;                    
            } else {
                let relPath = match[3];
                if (this.buildInfo.type('rel')) {
                    if (match[3].indexOf(this._devPath) === 0) {
                        relPath = this._distPath + 
                                match[3].substring(this._devPath.length);
                    }
                }

                let relation = path.join(relPath, match[4])
                        .replace(/\\/g, '/');

                relativeCss += `url(${open}${relation}${close})`;   

                // this._preloads.push(relation);
            }

            regexIndex = match.index + match[0].length;
        }
        relativeCss += css.substring(regexIndex, css.length);

        fs.writeFileSync(cssPath, relativeCss);
    }

    _getSources(fsPaths)
    {
        let sources = {
            '_default': '',
        };
        for (let variant of this._variants) {
            sources[variant] = '';
        }
        for (let substyle of this._substyles) {
            sources[substyle] = '';
        }

        this.console.log('Variables:');
        for (let fsPath of fsPaths.variables) {
            let relativePath = path.relative(this._sourceDirPath, fsPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sources['_default'] += '@import "{abWeb}' + relativePath + '";\r\n';
            for (let variant of this._variants) {
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
            }

            this.console.log('    - ' + relativePath);
        }

        for (let variant of this._variants) {
            this.console.log('Variant: ' + variant);
            
            for (let fsPath of fsPaths[`variants.${variant}.variables`]) {
                let relativePath = path.relative(this._sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');

                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';

                this.console.log('    - ' + relativePath);
            }
        }

        for (let substyle of this._substyles) {
            this.console.log('Substyle: ' + substyle);
            
            for (let fsPath of fsPaths[`substyles.${substyle}.variables`]) {
                let relativePath = path.relative(this._sourceDirPath, fsPath);
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

            let relativePath = path.relative(this._sourceDirPath, fsPath);
            relativePath = relativePath.replace(/\\/g, '/');
            if (path.extname(relativePath) === '.css')
                relativePath += '-abWeb';

            sources['_default'] += '@import "{abWeb}' + relativePath + '";\r\n';
            for (let variant of this._variants) {
                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';
            }

            this.console.log('    - ' + relativePath);
        }

        for (let variant of this._variants) {
            this.console.log('Variant: ' + variant);
            
            for (let fsPath of fsPaths[`variants.${variant}.styles`]) {
                if (path.basename(fsPath) === 'variables.scss')
                    continue;

                let relativePath = path.relative(this._sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                if (path.extname(relativePath) === '.css')
                    relativePath += '-abWeb';

                sources[variant] += '@import "{abWeb}' + relativePath + '";\r\n';

                this.console.log('    - ' + relativePath);
            }
        }

        for (let substyle of this._substyles) {
            this.console.log('Variant: ' + substyle);
            
            for (let fsPath of fsPaths[`substyles.${substyle}.styles`]) {
                if (path.basename(fsPath) === 'variables.scss')
                    continue;

                let relativePath = path.relative(this._sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
                if (path.extname(relativePath) === '.css')
                    relativePath += '-abWeb';

                sources[substyle] += '@import "{abWeb}' + relativePath + '";\r\n';

                this.console.log('    - ' + relativePath);
            }
        }

        return sources;
    }

    _parseSource(url, prev, done)
    {
        if (url.indexOf('{abWeb}') === 0) {
            url = url.substring('{abWeb}'.length);
        }

        if (path.extname(url) === '.css-abWeb')
            url = url.substring(0, url.length - '-abWeb'.length);

        let urlPath = path.join(this._sourceDirPath, url);
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

                let open = typeof(match[1]) === 'undefined' ? '' : match[1];
                let close = typeof(match[3]) === 'undefined' ? '' : match[3];

                if (open !== close)
                    continue;

                relativeSass += sass.substring(regexIndex, match.index);
                let relation = path.relative(this.cssDir, 
                        path.dirname(urlPath)).replace(/\\/g, '/');

                relativeSass += `url(${open}{${relation}}${match[2]}${close})`;

                regexIndex = match.index + match[0].length;
            }
            relativeSass += sass.substring(regexIndex, sass.length);

            done({ contents: relativeSass });
        });
    }

    // _replaceRelativeUrls_ParseUrlPath(urlPaths, url, prev)
    // {
    //     let prevPath = null;

    //     for (let i = urlPaths.length - 1; i >= 0; i--) {
    //         if (urlPaths[i].url === prev) {
    //             prevPath = urlPaths[i].path;
    //             break;
    //         }
    //     }
    //     if (prevPath === null)
    //         prevPath = path.resolve(prev);

    //     let urlPath = path.join(path.dirname(prevPath), url);

    //     urlPaths.push({
    //         url: url,
    //         path: urlPath,
    //     });

    //     return urlPath;
    // }


    /* abWeb.Ext Overrides */
    __build(taskName)
    {
        let promises = [];
        for (let sourceAlias in this._sources) {
            let sourcePath = sourceAlias === '_default' ? 
                    this._sourcePath : (this._sourcePath_Base + '-' + 
                    sourceAlias + '.css');

            promises.push(() => { return new Promise((resolve, reject) => {
                let compress = false;
                let dumpLineNumbers = 'comments';

                if (this.buildInfo.type('rel')) {
                    compress = true;
                    dumpLineNumbers = null
                }

                let urlPaths = [];

                dartSass.render({
                    data: this._sources[sourceAlias],
                    file: sourcePath,
                    includePaths: [ this._sourceDirPath ],
                    importer: (url, prev, done) => {                    
                        return this._parseSource(url, prev, done);
                    },
                    outputStyle: this.buildInfo.type('rel') ? 'compressed' : 'expanded',
                }, (err, result) => {
                    if (err) {
                        this.console.error('Error compiling sass.');
                        this.console.warn(err);
                        this.console.warn('  File: ' + err.file)
                        this.console.warn('  Index: ' + err.column)
                        this.console.warn('  Line: ' + err.line)

                        resolve(); return;
                    }

                    // this._preloads = [];

                    this._createCss(result.css.toString('utf-8'), sourceAlias);
                    
                    if (this._header.hasTagsGroup_Header('preloads'))
                        this._header.clearTagsGroup_Header('preloads');
                    
                    // for (let preload of this._preloads) {
                    //     let as = null;
                    //     let ext = path.extname(preload).toLowerCase();
                    //     let extRaw = ext.split('?')[0].split('#')[0];
                    //     let preloadUri = preload.substring(0, preload.length - ext.length) +
                    //             extRaw;
                    //     if ([ '.jpg', '.jpeg', '.gif', '.png' ].includes(ext)) {
                    //         as = 'image';
                    //     } else if ([ '.eot', '.eot?#iefix', '.woff', '.woff2', '.ttf', '.svg',
                    //             '.svg#fontawesome' ]
                    //             .includes(ext)) {
                    //         as = 'font';
                    //     } else
                    //         continue;

                    //     this._header.addTag_Header('preloads', 'link', {
                    //         rel: "preload",
                    //         href: preloadUri,
                    //         as: as,
                    //     }); 
                    // }

                    resolve();
                });
            })});
        }
    
        return (async () => {
            for (let promise of promises)
                await promise();

            this._header.build();

            this.console.success('Finished.');
        })();
    }

    __onChange(fsPaths, changes)
    {        
        this._sources = this._getSources(fsPaths);
        this.build();
    }

    __parse(config)
    {
        if (!('paths' in config))
            return;

        if (config.addToHeader) {
            this._header.addTag_Header('sass', 'link', {
                id: 'ABWeb_Sass_Styles',
                rel: "stylesheet",
                href: this.uri(this._sourcePath, true),
                type: "text/css"
            });

            this._header.addTagsGroup_Header('preloads', {
                'after': [ 'sass' ],
            });
        }

        this._variablesPaths = [];
        this._stylesPaths = [];
        this._variantPaths = {};
        this._substylePaths = {};
        // this._preloads = [];

        let watchPaths = [];
        for (let fsPath of config.paths) {
            if (path.extname(fsPath) === '.scss' || path.extname(fsPath) === '.css') {
                this._stylesPaths.push(fsPath);

                watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
            } else if (path.extname(fsPath) === '') {
                this._variablesPaths.push(path.join(fsPath, 'variables.scss'));
                this._stylesPaths.push(path.join(fsPath, 'styles.scss'));

                watchPaths.push(path.join(fsPath, '*.*css'));
            } else
                this.console.error('Unknown extension type: ', fsPath);
        }

        for (let variant in config.variants) {
            this._variants.push(variant);

            let variant_VariablePaths = [];
            let variant_StylePaths = [];

            for (let fsPath of config.variants[variant]) {
                if (path.extname(fsPath) === '.scss' || 
                        path.extname(fsPath) === '.css') {
                    variant_StylePaths.push(fsPath);

                    watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
                } else if (path.extname(fsPath) === '') {
                    variant_VariablePaths.push(path.join(fsPath, 'variables.scss'));
                    variant_StylePaths.push(path.join(fsPath, 'styles.scss'));
    
                    watchPaths.push(path.join(fsPath, '*.*css'));
                } else
                    this.console.error('Unknown extension type: ', fsPath);
            }

            this.watch(`variants.${variant}.variables`, [ 'add', 'unlink', 'change' ], 
                    variant_VariablePaths);
            this.watch(`variants.${variant}.styles`, [ 'add', 'unlink', 'change' ], 
                    variant_StylePaths);
        }

        for (let substyle in config.substyles) {
            this._substyles.push(substyle);

            let substyle_VariablePaths = [];
            let substyle_StylePaths = [];

            for (let fsPath of config.substyles[substyle]) {
                if (path.extname(fsPath) === '.scss' || 
                        path.extname(fsPath) === '.css') {
                    substyle_StylePaths.push(fsPath);

                    watchPaths.push(path.join(path.dirname(fsPath), '*.*css'));
                } else if (path.extname(fsPath) === '') {
                    substyle_VariablePaths.push(path.join(fsPath, 'variables.scss'));
                    substyle_StylePaths.push(path.join(fsPath, 'styles.scss'));
    
                    watchPaths.push(path.join(fsPath, '*.*css'));
                } else
                    this.console.error('Unknown extension type: ', fsPath);
            }

            this.watch(`substyles.${substyle}.variables`, [ 'add', 'unlink', 'change' ], 
                    substyle_VariablePaths);
            this.watch(`substyles.${substyle}.styles`, [ 'add', 'unlink', 'change' ], 
                    substyle_StylePaths);
        }

        this.watch('scss', [ 'add', 'unlink', 'change' ], watchPaths);
        this.watch('variables', [ 'add', 'unlink', 'change' ], this._variablesPaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], this._stylesPaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Sass;
