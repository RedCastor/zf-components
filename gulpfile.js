// ## Globals
var fs           = require('fs');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var changed      = require('gulp-changed');
var concat       = require('gulp-concat');
var flatten      = require('gulp-flatten');
var gulp         = require('gulp');
var rename       = require('gulp-rename');
var runSequence  = require('run-sequence');
var gulpif       = require('gulp-if');
var imagemin     = require('gulp-imagemin');
var jshint       = require('gulp-jshint');
var merge        = require('merge-stream');
var cssnano      = require('cssnano');
var plumber      = require('gulp-plumber');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var stripComments = require('gulp-strip-comments');
var stripCssComments = require('gulp-strip-css-comments');
var uglify       = require('gulp-uglify');
var path         = require('path');


var currentPath = path.parse(__dirname);

var assets = {
    styles: [
        'build/**/*'
    ],
    dest: './dist',
    styleFilename: 'zf-components.css'
};



var getExtension = function(path) {
    var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
        // (supports `\\` and `/` separators)
        pos = basename.lastIndexOf(".");       // get last position of `.`

    if (basename === "" || pos < 1) {
        return "";                             //  `.` not found (-1) or comes first (0)
    }            // if file name is empty or ...


    return basename.slice(pos + 1);            // extract extension ignoring `.`
};

var getFolders = function (dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
};

// ### CSS processing pipeline
var cssTasks = function(src, dest, filename, min) {

    var autoprefixer_fn = autoprefixer({
        browsers: [
            'defaults',
            'last 4 versions',
            'last 6 iOS versions',
            'last 6 Android versions',
            'last 6 Safari versions',
            'last 2 ie versions'
        ]
    });

    var cssnano_fn = cssnano({
        safe: true,
        discardComments: {removeAll: true}
    });


    var is_filename = filename ? true : false;

    return gulp.src(src)
        .pipe(plumber())
        .pipe(gulpif(!min, sourcemaps.init()) )
        .pipe(sass({
            outputStyle: 'nested', // libsass doesn't support expanded yet
            precision: 10,
            includePaths: ['.'],
            errLogToConsole: true
        }))
        .pipe(gulpif(is_filename, concat(filename)))
        .pipe(gulpif(min, postcss([autoprefixer_fn, cssnano_fn])))
        .pipe(gulpif(!min, postcss([autoprefixer_fn])))
        .pipe(gulpif(min, rename({ suffix: '.min' })) )
        .pipe(stripCssComments())
        .pipe(gulpif(!min, sourcemaps.write('.', { sourceRoot: 'styles/' })) )
        .pipe(gulp.dest(dest));
};


var jshintTasks = function(src) {

    return gulp.src(src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
};


// ### JS processing pipeline
var jsTasks = function(src, dest, filename, min) {

    var is_filename = filename ? true : false;
    var options = {};

    if (!min) {
        options = {
            mangle: false,
            compress: false,
            output: { beautify: true }
        };
    }

    return gulp.src(src)
        .pipe(gulpif(!min, sourcemaps.init()) )
        .pipe(ngAnnotate())
        .pipe(gulpif(is_filename, concat(filename)))
        .pipe(uglify(options))
        .pipe(gulpif(min, rename({ suffix: '.min' })))
        .pipe(gulpif(!min, sourcemaps.write('.', { sourceRoot: 'scripts/' })) )
        .pipe(gulp.dest(dest));
};


// ### Images processing pipeline
var imagesTasks = function(src, dest) {

    return gulp.src(src)
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.gifsicle({interlaced: true}),
            imagemin.svgo({plugins: [
                {removeUnknownsAndDefaults: false},
                {cleanupIDs: false}
            ]})
        ]))
        .pipe(gulp.dest(dest));
};


// ### Templates processing pipeline
var tplTasks = function(src, dest, tpl_name, module_name) {

    return gulp.src(src)
        .pipe(ngTemplateCache(tpl_name + '-tpls' +'.js', { module: module_name, standalone:false }))
        .pipe(gulp.dest(dest));

};

// ### JSHint
// `gulp jshint` - Lints configuration JSON and project JS.
gulp.task('jshint', function() {

    return jshintTasks(['bower.json', 'gulpfile.js'].concat(assets.src));
});

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, [assets.dest]));



// ### JS processing pipeline
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes Bower JS
// and project JS.
gulp.task('scripts', function() {

    return jsTasks(assets.src, assets.dest, assets.scriptFileName, false);
});

// ### JS processing pipeline minify
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes Bower JS
// and project JS.
gulp.task('scripts_min', function() {

    return jsTasks(assets.src, assets.dest, assets.scriptFileName, true);
});



// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
// By default this task will only log a warning if a precompiler error is
// raised. If the `--production` flag is set: this task will fail outright.
gulp.task('styles', function() {

    return cssTasks(assets.styles, assets.dest, assets.styleFilename, false);
});
gulp.task('styles_min', function() {

    return cssTasks(assets.styles, assets.dest, assets.styleFilename, true);
});



// ### Build
// `gulp build` - Run all the build tasks but don't clean up beforehand.
// Generally you should be running `gulp` instead of `gulp build`.
gulp.task('build', function(callback) {
    runSequence(
        'styles',
        'styles_min',
        callback);
});

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', ['clean'], function() {
    gulp.start('build');
});