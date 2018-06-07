'use strict';

const fs = require('fs');
const path = require('path');

const abFS = require('ab-fs');
const abWeb = require('../../.');
const less = require('less');


class abWeb_Less extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._header = this.uses('header');

        this._source = '';
        this._sourcePath = path.join(this.buildInfo.front, 'css');

        this._header.addTag('less', 'link', {
            rel: "stylesheet",
            href: this.uri(path.join(this._sourcePath, 'less.css'), true),
            type: "text/css"
        });
    }


    _createCss(css_source)
    {
        let css_dir = path.join(this.buildInfo.front, 'css');
        let css_path = path.join(css_dir, 'less.css');

        if (!abFS.dir.existsSync(css_dir)) {
            this.console.warn(`\`${css_dir}\` does not exist. Creating...`);
            abFS.dir.createRecursiveSync(css_dir);
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
        css_source = css_source.replace(re, "url($1" + index_uri_replace);

        fs.writeFileSync(css_path, css_source);
    }

    _getSource(fsPaths)
    {
        let lessSource = '';

        this.console.log('Variables:');
        let variablePaths = fsPaths.variables;
        for (let variableFSPath of fsPaths.variables) {
            let relativePath = path.relative(this._sourcePath, variableFSPath);
            relativePath = relativePath.replace(/\\/g, '/');

            lessSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }
        lessSource += '\r\n';

        this.console.log('Styles:');
        for (let styles_fsPath of fsPaths.styles) {
            let relativePath = path.relative(this._sourcePath, styles_fsPath);
            relativePath = relativePath.replace(/\\/g, '/');

            lessSource += '@import "' + relativePath + '";\r\n';

            this.console.log('    - ' + relativePath);
        }

        return lessSource;
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

            less.render(this._source, {
                paths: [ this._sourcePath ],
                filename: 'source.less',
                compress: compress,
                dumpLineNumbers: dump_line_numbers,
                relativeUrls: true
            },(err, output) => {
                if (err) {
                    this.console.error('Error compiling less.');
                    this.console.warn(err);
                    this.console.warn('  File: ' + err.filename)
                    this.console.warn('  Index: ' + err.index)
                    this.console.warn('  Line: ' + err.line)

                    reject();
                }

                this._createCss(output.css);

                this._header.build();

                this.console.success('Finished.');
                resolve();
            });
        });
    }

    __onChange(fsPaths, changes)
    {
        this._source = this._getSource(fsPaths);
        this.build();
    }

    __parse(config)
    {
        if (!('paths' in config))
            return;

        let variablePaths = [];
        let stylesPaths = [];
        for (let fsPath of config.paths) {
            variablePaths.push(path.join(fsPath, 'variables.less'));
            stylesPaths.push(path.join(fsPath, 'styles.less'));
        }

        this.watch('variables', [ 'add', 'unlink', 'change' ], variablePaths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], stylesPaths);
    }
    /* / abWeb.Ext Overrides */

}
module.exports = abWeb_Less;
