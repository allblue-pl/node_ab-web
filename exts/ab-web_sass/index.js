'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const nodeSass = require('node-sass');


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
    }


    _createCss(cssSource, sourceAlias)
    {
        let cssPath = path.join(this.cssDir, sourceAlias === '_default' ? 
                'sass.css' : `sass-${sourceAlias}.css`);

        // let indexPath = this.buildInfo.index;

        // /* Replace `url` */
        // let indexPathRe = indexPath
        //     .replace(/\./gm, '\\.')
        //     .replace(/\//gm, '(\\/|\\\\)')
        //     .replace(/\\/gm, '(\\/|\\\\)');
        // let indexUriReplace = './' + path.relative(this._sourcePath,
        //         indexPath).replace(/\\/g, '/');

        // console.log(indexUriReplace);
        // console.log(indexPathRe);
        
        // let re = new RegExp('url\\((\'|")' + indexPathRe, 'gm');
        // while(true) {
        //     let match = re.exec(cssSource);
        //     console.log(match);
        //     if (match === null)
        //         break;

        //     console.log(indexUriReplace, match); 
        // }
        // cssSource = cssSource.replace(re, "url($1" + indexUriReplace);

        fs.writeFileSync(cssPath, cssSource);
    }

    _getSources(fsPaths)
    {
        let sources = {
            '_default': '',
        };
        for (let variant of this._variants) {
            sources[variant] = '';
        }

        this.console.log('Variables:');
        for (let fsPath of fsPaths.variables) {
            let relativePath = path.relative(this._sourceDirPath, fsPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sources['_default'] += '@import "' + relativePath + '";\r\n';
            for (let variant of this._variants) {
                sources[variant] += '@import "' + relativePath + '";\r\n';
            }

            this.console.log('    - ' + relativePath);
        }

        for (let variant of this._variants) {
            this.console.log('Variant: ' + variant);
            
            for (let fsPath of fsPaths[`variants.${variant}.variables`]) {
                let relativePath = path.relative(this._sourceDirPath, fsPath);
                relativePath = relativePath.replace(/\\/g, '/');
    
                sources[variant] += '@import "' + relativePath + '";\r\n';

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

            sources['_default'] += '@import "' + relativePath + '";\r\n';
            for (let variant of this._variants) {
                sources[variant] += '@import "' + relativePath + '";\r\n';
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
    
                sources[variant] += '@import "' + relativePath + '";\r\n';

                this.console.log('    - ' + relativePath);
            }
        }

        return sources;
    }

    _parseSource(url, prev, done)
    {
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

            let regex = /url\(\s*([\'"])(?!(?:https?:)?\/\/)(?!data:)(.*?)([\'"])\s*\)/gm;
            let regexIndex = 0;
            while (true) {
                let match = regex.exec(sass);
                if (match === null)
                    break;

                relativeSass += sass.substring(regexIndex, match.index);

                let matchPath = path.join(path.dirname(urlPath), match[2]);
                let relation = path.relative(this._sourceDirPath, matchPath)
                        .replace(/\\/g, '/');

                relativeSass += `url(${match[1]}${relation}${match[3]})`;
                regexIndex = match.index + match[0].length;
            }
            relativeSass += sass.substring(regexIndex, sass.length);
            // console.log(relativeSass);
            // sass = sass.replace(/url\(\s*([\'"])(?!(?:https?:)?\/\/)(?!data:)\s*/g, 
            //         'url($1' + relation + '/');
            // sass = sass.replace(/url\((?!\s*[\'"])\s*/g, 
            //         `url('${relation}/' + `);

            done({ contents: relativeSass });
        });
    }

    _replaceRelativeUrls_ParseUrlPath(urlPaths, url, prev)
    {
        let prevPath = null;

        for (let i = urlPaths.length - 1; i >= 0; i--) {
            if (urlPaths[i].url === prev) {
                prevPath = urlPaths[i].path;
                break;
            }
        }
        if (prevPath === null)
            prevPath = path.resolve(prev);

        let urlPath = path.join(path.dirname(prevPath), url);

        urlPaths.push({
            url: url,
            path: urlPath,
        });

        return urlPath;
    }


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
                nodeSass.render({
                    data: this._sources[sourceAlias],
                    file: sourcePath,
                    includePaths: [ this._sourceDirPath ],
                    importer: (url, prev, done) => {                    
                        return this._parseSource(url, prev, done);
                    },
                    outputStyle: this.buildInfo.type('rel') ? 'compressed' : 'nested',
                }, (err, result) => {
                    if (err) {
                        this.console.error('Error compiling sass.');
                        this.console.warn(err);
                        this.console.warn('  File: ' + err.file)
                        this.console.warn('  Index: ' + err.column)
                        this.console.warn('  Line: ' + err.line)

                        resolve(); return;
                    }

                    this._createCss(result.css.toString('utf-8'), sourceAlias);
                    
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
            this._header.addTag('sass', 'link', {
                rel: "stylesheet",
                href: this.uri(this._sourcePath, true),
                type: "text/css"
            });
        }

        this._variablesPaths = [];
        this._stylesPaths = [];
        this._variantPaths = {};

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
    
                    variant_StylePaths.push(path.join(path.dirname(fsPath), '*.*css'));
                } else if (path.extname(fsPath) === '') {
                    variant_VariablePaths.push(path.join(fsPath, 'variables.scss'));
                    variant_StylePaths.push(path.join(fsPath, 'styles.scss'));
    
                    variant_StylePaths.push(path.join(fsPath, '*.*css'));
                } else
                    this.console.error('Unknown extension type: ', fsPath);
            }

            this.watch(`variants.${variant}.variables`, [ 'add', 'unlink', 'change' ], 
                    variant_VariablePaths);
            this.watch(`variants.${variant}.styles`, [ 'add', 'unlink', 'change' ], 
                    variant_StylePaths);
        }

        this.watch('scss', [ 'add', 'unlink', 'change' ], watchPaths);
        this.watch('variables', [ 'add', 'unlink', 'change' ], this._variablesPaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], this._stylesPaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Sass;
