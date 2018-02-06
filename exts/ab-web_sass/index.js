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

        this._source = '';
        this._sourcePath = path.join(this.buildInfo.front, 'css');

        this._header.addTag('sass', 'link', {
            rel: "stylesheet",
            href: this.uri(path.join(this._sourcePath, 'sass.css'), true),
            type: "text/css"
        });
    }


    _createCss(cssSource)
    {
        let cssDir = path.join(this.buildInfo.front, 'css');
        let cssPath = path.join(cssDir, 'sass.css');

        if (!abFS.dir.existsSync(cssDir)) {
            this.console.warn(`\`${cssDir}\` does not exist. Creating...`);
            abFS.dir.createRecursiveSync(cssDir);
        }

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
        for (let variable_fsPath of fsPaths.variables) {
            let relativePath = path.relative(this._sourcePath, variable_fsPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sassSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }
        sassSource += '\r\n';

        this.console.log('Styles:');
        for (let styles_fsPath of fsPaths.styles) {
            let relativePath = path.relative(this._sourcePath, styles_fsPath);
            relativePath = relativePath.replace(/\\/g, '/');

            sassSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }

        return sassSource;
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

            nodeSass.render({
                data: this._source,
                file: 'source.scss',
                includePaths: [ this._sourcePath ],
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

        let variablePaths = [];
        let styles_paths = [];
        for (let fsPath of config.paths) {
            variablePaths.push(path.join(fsPath, 'variables.scss'));
            styles_paths.push(path.join(fsPath, 'styles.scss'));
        }

        this.watch('variables', [ 'add', 'unlink', 'change' ], variablePaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], styles_paths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Sass;
