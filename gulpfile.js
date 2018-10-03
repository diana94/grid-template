var gulp = require('gulp'),
    connect = require('gulp-connect'),
    pug = require('gulp-pug'),
    runSequence = require('run-sequence'),
    rename = require('gulp-rename'),
    htmlbeautify = require('gulp-html-beautify'),
    prettify = require('gulp-html-prettify'),
    postcss = require('gulp-postcss'),
    cssimport = require('postcss-import'),
    cssmqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    cssmixin = require('postcss-mixins'),
    svginline = require('postcss-inline-svg'),
    presetenv = require('postcss-preset-env'),
    cssshort = require('postcss-short'),
    cssnested = require('postcss-nested'),
    svgSprite = require("gulp-svg-sprites");


var browsersList = [
    "last 3 versions",
    "ie >= 11"
];

// Parameters
function findParamArg(paramName, listCommands) {
    var index = listCommands.indexOf(paramName);
    if (index < 0) return null;
    var value = listCommands[index + 1];
    return value;
}

var pageName = findParamArg('-page', process.argv);
var cssName = findParamArg('-style', process.argv);
var htmlFile = "*";
var htmlPath = "**/*";
var cssFile = htmlFile;
var cssPath = htmlPath;

if (pageName) {
    htmlFile = pageName;
    htmlPath = pageName + '/' + pageName;

    if (!cssName) {
        cssFile = htmlFile;
        cssPath = htmlPath;
    } else if (cssName === "common") {
        cssFile = cssName;
        cssPath = cssFile + "/" + cssFile;
    }
}

// Server
gulp.task('connect', function () {

    connect.server({
        host: '0.0.0.0',
        root: '',
        livereload: true
    });
});

// Reload
gulp.task('reload', function () {

    gulp.src([
            htmlFile + '.html',
            'stylesheets/' + cssFile + '.css',
            '!stylesheets/' + cssFile + '.min.css'
        ])
        .pipe(connect.reload());
});

// Pug
gulp.task('pug', function () {
    return gulp.src('_pages/' + htmlPath + '.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(rename({
            dirname: ''
        }))
        .pipe(gulp.dest(''));
});

// HTML beautify
gulp.task('htmlbeautify', function() {

    return gulp.src(htmlFile + '.html')
        // .pipe(htmlbeautify())
        .pipe(prettify({indent_char: ' ', indent_size: 4, unformatted: ['i', 'b', 'strong']}))
        .pipe(gulp.dest(''));
});

// CSS
gulp.task('css', function () {

    return gulp.src('_pages/' + cssPath + '.css')
        .pipe(postcss([
            cssimport(),
            cssshort(),
            cssmixin(),
            svginline(),
            presetenv({
                stage: 0,
                autoprefixer: {
                    grid: true,
                    browsers: browsersList,
                },
            }),
            cssnested(),
            cssmqpacker(),
        ]))
        .pipe(gulp.dest('stylesheets/'));
});

// CSS minify
gulp.task('cssminify', function () {

    return gulp.src([
            'stylesheets/' + cssPath + '.css',
            '!stylesheets/' + cssPath + '.min.css'
        ])
        .pipe(postcss([
            cssnano({
                autoprefixer: false
            })
        ]))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('stylesheets/'));
});

//Svg sprites
// gulp.task('svgsprites', function () {
//     return gulp.src(['./images/icons/**/*.svg', './images/icons/_sprite/**/*.svg'])
//         .pipe(svgSprite())
//         .pipe(gulp.dest("./images/icons/_sprite"));
// });

// Flow 1
gulp.task('flow-1', function () {

    runSequence('pug', 'htmlbeautify', 'reload');
});

// Flow 2
gulp.task('flow-2', function () {

    runSequence('css', 'cssminify', 'reload');
});

// Build
gulp.task('build', function () {

    runSequence('css', 'cssminify', 'pug', 'htmlbeautify');
});

gulp.task('go', ['connect'], function () {

    gulp.watch([
        '_blocks/**/*.pug',
        '_pages/' + htmlPath + '.pug'
    ], ['flow-1']);

    gulp.watch([
        '_blocks/**/*.css',
        '_pages/' + cssPath + '.css'
    ], ['flow-2']);
});

gulp.task('default', function () {

});
