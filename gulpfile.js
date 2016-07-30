'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var bower = require('gulp-bower');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var sass = require('gulp-sass');
var less = require('gulp-less');
var flatten = require('gulp-flatten');
var eslint = require('gulp-eslint');

//Output destination
var base = '';
var dest = 'public/dist/';
var vendorDest = 'public/dist/vendor/';

const mainPaths = {
	js: [
		'public/js/module.js',
		'public/js/directives/**/*.js',
		'public/js/controllers/**/*.js'
	],
	css: [
		'public/css/app.css'
	]
};

//Run bower
gulp.task('bower', function () {
	return bower();
});

//Concatenate and minify iotdash JS
gulp.task('js', function () {
	gulp.src(mainPaths.js)
		.pipe(concat('main.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest(dest + 'js'));
});

//Concatenate and minify vendor CSS
gulp.task('css', function () {
	gulp.src(mainPaths.css, {
		base: base
	})
		.pipe(concat('app.css'))
		.pipe(uglifycss())
		.pipe(gulp.dest(dest + 'css'));
});

//Concatenate and minify vendor JS
gulp.task('vendorJs', function () {
	gulp.src(mainBowerFiles('**/*.js'))
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest(vendorDest + 'js'));
});

//Concatenate and minify vendor CSS
gulp.task('vendorCss', function () {
	var lessStream = gulp.src(mainBowerFiles('**/*.less'))
		.pipe(less())
		.pipe(concat('less-files.less'));

	var scssStream = gulp.src(mainBowerFiles('**/*.scss'))
		.pipe(sass())
		.pipe(concat('scss-files.scss'));

	var cssStream = gulp.src(mainBowerFiles('**/*.css'))
		.pipe(concat('css-files.css'));

	var mergedStream = merge(scssStream, lessStream, cssStream)
		.pipe(concat('style.css'))
		.pipe(uglifycss())
		.pipe(gulp.dest(vendorDest + 'css'));

	return mergedStream;
});

gulp.task('vendorFonts', function () {
	return gulp.src('./bower_components/**/*.{eot,svg,ttf,woff,woff2}', {
		base: base
	})
		.pipe(flatten())
		.pipe(gulp.dest(vendorDest + 'fonts'));
});

//Lint everything using elsint
gulp.task('lint', function () {
	return gulp.src(['**/**.js', '!gulpfile.js', '!public/dist/**', '!node_modules/**', '!bower_components/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('default', ['bower', 'lint', 'js', 'css', 'vendorFonts', 'vendorJs', 'vendorCss']);
