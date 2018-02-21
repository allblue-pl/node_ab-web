'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const nodeSass = require('node-sass');


class abWeb_Sass extends abWeb.Ext
{

    constructor(ab_web, extPath)
    { super(ab_web, extPath);
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
    }


    _createCss(cssSource)
    {
        let cssPath = path.join(this.cssDir, 'sass.css');

        let index_path = this.buildInfo.index;

        /* Replace `url` */
        let index_path_re = index_path
            .replace(/\./gm, '\\.')
            .replace(/\//gm, '(\\/|\\\\)')
            .replace(/\\/gm, '(\\/|\\\\)');
        let index_uri_replace = './' + path.relative(this._sourcePath,
                index_path).replace(/\\/g, '/');

        let re = new RegExp('url\\((\'|")' + index_path_re, 'gm');
        cssSource = cssSource.replace(re, "url($1" + index_uri_replace);

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
        if (path.extname(urlPath) !== '.scss')
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

            let relation = path.relative(this._sourceDirPath, 
                    path.dirname(urlPath)).replace(/\\/g, '/');
            sass = sass.replace(/url\(\s*([\'"])(?!(?:https?:)?\/\/)(?!data:)\s*/g, 
                    'url($1' + relation + '/');
            // sass = sass.replace(/url\((?!\s*[\'"])\s*/g, 
            //         `url('${relation}/' + `);

            done({ contents: sass });
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
    __build(task_name)
    {
        return new Promise((resolve, reject) => {
            this.console.info('Building...');

            let compress = false;
            let dump_line_numbers = 'comments';

            if (this.buildInfo.type('rel')) {
                compress = true;
                dump_line_numbers = null
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
            //     dumpLineNumbers: dump_line_numbers,
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

    __onChange(fsPaths, watcher_name, event_type)
    {
        this._source = this._getSource(fsPaths);
        this.build();
    }

    __parse(config)
    {
        if (!('paths' in config))
            return;

        let variablesPaths = [];
        let stylesPaths = [];
        for (let fsPath of config.paths) {
            if (path.extname(fsPath) === '.scss')
                stylesPaths.push(fsPath);
            else if (path.extname(fsPath) === '') {
                variablesPaths.push(path.join(fsPath, 'variables.scss'));
                stylesPaths.push(path.join(fsPath, 'styles.scss'));
            } else
                this.error('Unknown extension type: ', fsPath);
        }

        this.watch('variables', [ 'add', 'unlink', 'change' ], variablesPaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], stylesPaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Sass;
