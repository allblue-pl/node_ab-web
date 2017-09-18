'use strict';

const path = require('path');

const abWeb = require('ab-web');
const less = require('less');


class abWeb_Less extends abWeb.Ext
{

    constructor(ab_web, ext_path)
    { super(ab_web, ext_path);
        this._source = '';
        this._sourcePath = path.join(this.cache, 'source.less');
    }


    _getSource(fs_paths)
    {
        let less_source = '';

        this.console.log('Variables:');
        let variable_paths = fs_paths.variables;
        for (let variable_fs_path of fs_paths.variables.length) {
            let relative_path = path.resolve(variable_fs_path, this._sourcePath);
            less_source += '@import "' + relative_path + '";\r\n';

            this.console.log('    - ' + relative_path);
        }
        less_source += '\r\n';

        this.console.log('Styles:');
        for (let styles_fs_path of fs_paths.variables.length) {
            var relative_path = path.resolve(styles_fs_path, this._sourcePath);
            less_source += '@import "' + relative_path + '";\r\n';

            this.console.log('    - ' + relative_path);
        }

        return less_source;
    }


    /* abWeb.Ext Overrides */
    __buildTask(task_name)
    { let self = this;
        return new abWeb.Task(task_name, () => {
                return new Promise((resolve, reject) => {
            self.console.log('Building...');

            var compress = false;
            var dump_line_numbers = 'comments';

            if (self.buildInfo.type('rel')) {
                compress = true;
                dump_line_numbers = null
            }

            self.console.log('End');
            resolve();
            // less.render(less_source, {
            //     paths: [template.getPath_Index()],
            //     filename: 'ab.less',
            //     compress: compress,
            //     dumpLineNumbers: dump_line_numbers,
            //     relativeUrls: true
            // }, function(err, output) {
            //     if (err) {
            //         self.error('Error compiling less.');
            //         self.warn(err);
            //         self.warn('  File: ' + err.filename)
            //         self.warn('  Index: ' + err.index)
            //         self.warn('  Line: ' + err.line)
            //
            //         return sync.finished();
            //     }
            //
            //     var css_dir = path.join(template.getPath_Front(), 'css');
            //     var css_path = path.join(css_dir, 'ab-template.css');
            //     if (!abFiles.dir_Exists(css_dir)) {
            //         self.warn('`%s` does not exist. Creating...', css_dir);
            //         abFiles.dir_Create(css_dir);
            //     }
            //
            //     var index_path = template.getPath_Index();
            //
            //     /* Replace `url` */
            //     var index_path_re = index_path
            //         .replace(/\./gm, '\\.')
            //         .replace(/\//gm, '\\/');
            //     var index_uri_replace = './' + template.getRelativeUri(css_dir,
            //             template.getPath_Index()) + '/';
            //
            //     var re = new RegExp('url\\((\'|")' + index_path_re, 'gm');
            //     var css = output.css.replace(re, "url($1" + index_uri_replace);
            //
            //     abFiles.file_PutContent(css_path, css);
            //
            //     self.success('Generated `css/ab-template.css`');
            //
            //     return sync.finished();
            // });
        }); });
    }

    __parse(config)
    {
        if (!('paths' in config))
            return;

        let variable_paths = [];
        let styles_paths = [];
        for (let fs_path of config.paths) {
            variable_paths.push(path.join(fs_paths, 'variables.less'));
            styles_paths.push(path.join(fs_paths, 'styles.less'));
        }

        this.watch('variables', [ 'add', 'unlink', 'change' ], variable_paths);
        this.watch('styles', [ 'add', 'unlink', 'change' ], styles_paths);
    }
    /* / abWeb.Ext Overrides */

}
