var gulp = require('gulp'),
	path = require('path'),

	p = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'gulp.*'],
		replaceString: /\bgulp[\-.]/,
		rename: {
			'gulp-tinypng-compress': 'tinypng',
			'gulp-combine-mq': 'cmq',
			'gulp-util': 'gutil',
			'gulp-css-globbing': 'glob'
		}
	}),

	handle = require('./gulp/lib/handlers.js'), // custom handlers

	c = p.gutil.colors,
	pkg = require('./package.json'),
	bigfork = require(process.env.HOME + '/bigfork.json'),

	// options!
	opt = {
		scss_lint: {
			src: ['themes/' + pkg.name + '/scss/**/!(_reset|_normalize)*.scss']
		},
		css: {
			src: [
				'themes/' + pkg.name + '/scss/editor.scss',
				'themes/' + pkg.name + '/scss/style*.scss'
			],
			dest: 'themes/' + pkg.name + '/css/'
		},
		png: {
			src: ['themes/' + pkg.name + '/images/src/**/*.png'],
			dest: 'themes/' + pkg.name + '/images/'
		},
		js: {
			src: [
				'themes/' + pkg.name + '/js/src/!(app)*.js',
				'themes/' + pkg.name + '/js/src/app.js'
			],
			dest: 'themes/' + pkg.name + '/js/'
		}
	};

/* config getter */
var config = function(name) {
	return opt[name.replace('-', '_')];
};

/* begin tasks */

// lint css
gulp.task('scss-lint', function() {
	var conf = config('scss-lint');
	return gulp.src(conf.src)
		.pipe(p.scsslint('.scss-lint.yml'))
		.pipe(p.scsslint.reporter(handle.lint.error))
});

// compile scss into css
gulp.task('css', ['scss-lint'], function() {
	var conf = config('css');
	return gulp.src(conf.src)
		.pipe(p.plumber({errorHandler: handle.generic.error}))
		.pipe(p.glob({
			extensions: ['.scss']
		}))
		.pipe(p.sass())
		.pipe(p.autoprefixer({
			browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.1']
		}))
		.pipe(p.cmq())
		.pipe(handle.minify())
		.pipe(handle.generic.log('compiled'))
		.pipe(handle.notify.show('CSS compiled - <%= file.relative %>'))
		.pipe(gulp.dest(conf.dest));
});

// lint, concat and uglify javascript
gulp.task('js', function() {
	var conf = config('js');
	return gulp.src(conf.src)
		.pipe(p.plumber({errorHandler: handle.generic.error}))
		.pipe(p.jshint({
			esnext: true
		}))
		.pipe(p.babel())
		.pipe(p.uglify())
		.pipe(p.concat('app.min.js'))
		.pipe(handle.generic.log('compiled'))
		.pipe(handle.notify.show('JS compiled - <%= file.relative %>'))
		.pipe(gulp.dest(conf.dest));
});

// compress pngs
gulp.task('png', function() {
	var conf = config('png');
	return gulp.src(conf.src)
		.pipe(p.plumber({errorHandler: handle.generic.error}))
		.pipe(p.tinypng({
			key: bigfork.tinypng,
			checkSigs: true,
			sigFile: 'themes/' + pkg.name + '/images/.tinypng-sigs'
		}))
		.pipe(handle.generic.log('compressed', false, function(file, msg, opt) {
			if(file.skipped) {
				msg = c.gray('skipped');
				opt.type = 'bad';
			}
			return arguments;
		}))
		.pipe(handle.notify.show('Images compressed'))
		.pipe(gulp.dest(conf.dest));
});

gulp.task('default', function() {
	gulp.start(['css', 'js']);
});

// watch tasks
gulp.task('watch', function() {
	gulp.watch('themes/' + pkg.name + '/scss/**/*.scss', function() {
		gulp.start('css');
	});

	gulp.watch('themes/' + pkg.name + '/js/src/*.js', function() {
		gulp.start('js');
	});
});
