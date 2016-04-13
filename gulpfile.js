var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    filelog = require('gulp-filelog'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    yuidoc = require("gulp-yuidoc"),
    jshint = require('gulp-jshint'),
    coveralls = require('gulp-coveralls'),
    options = {
        globals: {
            exports: true,
            console: true,
            DEBUG: true,
            window: true
        },
        laxcomma: true,
        strict: false,
        validthis: true,
        undef: true
    };

gulp.task('default', function () {
    gulp.src('di.js')
        .pipe(filelog())
        .pipe(jshint(options))
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(rename('di.min.js'))
        .pipe(gulp.dest('.'));

    gulp.src("di.js")
      .pipe(yuidoc())
      .pipe(gulp.dest("./doc"));
});

gulp.task('lint', function() {
  return gulp.src('di.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function (done) {
    var Server = require('karma').Server;
    new Server({
        autoWatch: true,
        browsers: [
            //'PhantomJS2'
            'Chrome'
        ],
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },
        frameworks: [ 'browserify', 'jasmine'],
        files: [
            './di.js',
            './tests/spec-helpers.js',
            './tests/di.spec.js'
        ],
        junitReporter: {
            outputFile: 'target/junit.xml'
        },
        preprocessors: {
            './di.js': ['coverage', 'browserify'],
            './tests/di.spec.js': ['browserify']
        },
        browserify: {
            debug: true,
            transform: [ 'brfs', 'bulkify' ]
        },
        reporters: [
            'junit',
            'coverage'
        ],
        singleRun: false,
        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        }
    }).start();
});

gulp.task('coveralls', ['test'], function () {
    gulp.src('coverage/**/lcov.info')
      .pipe(coveralls());
});