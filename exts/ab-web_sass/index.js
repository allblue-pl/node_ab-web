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

        this._sourceDirPath = this.cssDir;
        this._sourcePath = path.join(this.cssDir, 'sass.css');

        this._header.addTag('sass', 'link', {
            rel: "stylesheet",
            href: this.uri(this._sourcePath, true),
            type: "text/css"
        });

        this._variablesPaths = [];
        this._stylesPaths = [];
    }


    _createCss(cssSource)
    {
        let cssPath = path.join(this.cssDir, 'sass.css');

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

    _getSource(fsPaths)
    {
        let sassSource = '';

        this.console.log('Variables:');
        let variablePaths = fsPaths.variables;
        for (let variables_FSPath of fsPaths.variables) {
            let relativePath = path.relative(this._sourceDirPath, variables_FSPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sassSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }
        sassSource += '\r\n';

        this.console.log('Styles:');
        for (let styles_FSPath of fsPaths.styles) {
            let relativePath = path.relative(this._sourceDirPath, styles_FSPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sassSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }

        return sassSource;
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
        return new Promise((resolve, reject) => {
            this.console.info('Building...');

            let compress = false;
            let dumpLineNumbers = 'comments';

            if (this.buildInfo.type('rel')) {
                compress = true;
                dumpLineNumbers = null
            }

            let urlPaths = [];
            nodeSass.render({
                data: this._source,
                file: this._sourcePath,
                includePaths: [ this._sourceDirPath ],
                importer: (url, prev, done) => {                    
                    return this._parseSource(url, prev, done);
                },
            }, (err, result) => {
                if (err) {
                    this.console.error('Error compiling sass.');
                    this.console.warn(err);
                    this.console.warn('  File: ' + err.file)
                    this.console.warn('  Index: ' + err.column)
                    this.console.warn('  Line: ' + err.line)

                    resolve(); return;
                }

                this._createCss(result.css.toString('utf-8'));

                this._header.build();

                this.console.success('Finished.');
                resolve();
            });

            // less.render(this._source, {
            //     paths: [ this._sourcePath ],
            //     filename: 'source.less',
            //     compress: compress,
            //     dumpLineNumbers: dumpLineNumbers,
            //     relativeUrls: true
            // },(err, output) => {
            //     if (err) {
            //         this.console.error('Error compiling less.');
            //         this.console.warn(err);
            //         this.console.warn('  File: ' + err.filename)
            //         this.console.warn('  Index: ' + err.index)
            //         this.console.warn('  Line: ' + err.line)

            //         reject();
            //     }

            //     this._createCss(output.css);

            //     this._header.build();

            //     this.console.success('Finished.');
            //     resolve();
            // });
        });
    }

    __onChange(fsPaths, watcherName, eventType)
    {        
        this._source = this._getSource(fsPaths);
        this.build();
    }

    __parse(config)
    {
        if (!('paths' in config))
            return;

        this._variablesPaths = [];
        this._stylesPaths = [];
        let watchPaths = [];
        for (let fsPath of config.paths) {
            if (path.extname(fsPath) === '.scss' || path.extname(fsPath) === '.css') {
                this._stylesPaths.push(fsPath);

                watchPaths = path.join(path.dirname(fsPath), '*.*css');
            } else if (path.extname(fsPath) === '') {
                this._variablesPaths.push(path.join(fsPath, 'variables.scss'));
                this._stylesPaths.push(path.join(fsPath, 'styles.scss'));

                watchPaths = path.join(fsPath, '*.*css');
            } else
                this.console.error('Unknown extension type: ', fsPath);
        }

        this.watch('scss', [ 'add', 'unlink', 'change' ], watchPaths);
        this.watch('variables', [ 'add', 'unlink', 'change' ], this._variablesPaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], this._stylesPaths)
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Sass;
