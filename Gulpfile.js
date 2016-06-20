var gulp = require('gulp'),

	/* env */
	pkg = require('./package.json'),
	bigfork = require(process.env.HOME + '/bigfork.json'),

	/* util */
	path = require('path'),
	handle = require('gulp-bigfork-handler')(pkg), // custom handlers,
	plumber = require('gulp-plumber'),
	concat = null,
	watch = null,
	browsersync = require('browser-sync').create(),

	/* css */
	scsslint = null,
	sass = null,
	autoprefix = null,
	cmq = null,
	cssglob = null,
	cssnano = null,

	/* js */
	jshint  = null,
	uglify = null,
	babel = null,

	browserify = null,
	source = null,
	buffer = null,
	glob = null,

	/* img */
	tinypng = null,

	// options!
	opt = {
		scsslint: {
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
			src: 'themes/' + pkg.name + '/js/src/*.js',
			dest: 'themes/' + pkg.name + '/js/'
		}
	};

/* begin tasks */

// lint css
gulp.task('scss-lint', function() {
	scsslint = require('gulp-scsslint');

	var conf = opt.scsslint;

	return gulp.src(conf.src)
		.pipe(scsslint('.scss-lint.yml'))
		.pipe(scsslint.reporter(handle.lint.error))
});

// compile scss into css
gulp.task('css', ['scss-lint'], function() {
	sass = require('gulp-sass');
	autoprefix = require('gulp-autoprefixer');
	cmq = require('gulp-combine-mq');
	cssglob = require('gulp-css-globbing');
	cssnano = require('gulp-cssnano');

	var conf = opt.css;

	return gulp.src(conf.src)
		.pipe(plumber({errorHandler: handle.generic.error}))
		.pipe(cssglob({
			extensions: ['.scss']
		}))
		.pipe(sass())
		.pipe(autoprefix({
			browsers: ['ie >= 8', 'safari >= 8', '> 1%']
		}))
		.pipe(cmq())
		.pipe(cssnano({
			autoprefixer: false,
			zindex: false
		}))
		.pipe(handle.generic.log('compiled'))
		.pipe(handle.notify.show('CSS compiled - <%= file.relative %>'))
		.pipe(gulp.dest(conf.dest))
		.pipe(browsersync.stream());
});

// lint, concat and uglify javascript
gulp.task('js', function() {
	concat = require('gulp-concat');
	jshint  = require('gulp-jshint');
	uglify = require('gulp-uglify');
	babel = require('gulp-babel');
	browserify = require('browserify');
	source = require('vinyl-source-stream');
	buffer = require('vinyl-buffer');
	glob = require('glob');

	var conf = opt.js;

	glob(conf.src, function(err, files) {
		files.map(function(entry) {
			return browserify(entry).bundle()
				.pipe(plumber({errorHandler: handle.generic.error}))
				.pipe(source(path.basename(entry).replace(/\.js$/, '.min.js')))
				.pipe(buffer())
				.pipe(jshint({
					esnext: true
				}))
				.pipe(babel())
				.pipe(uglify())
				.pipe(handle.generic.log('compiled'))
				.pipe(handle.notify.show('JS compiled - <%= file.relative %>'))
				.pipe(gulp.dest(conf.dest));
		})
	});
});

// compress pngs
gulp.task('png', function() {
	tinypng = require('gulp-tinypng-compress');

	var conf = opt.png;

	return gulp.src(conf.src)
		.pipe(plumber({errorHandler: handle.generic.error}))
		.pipe(tinypng({
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
	watch = require('gulp-watch');

	var parent = path.basename(path.join(__dirname, '../'));

	if(parent == 'Devsites') {
		browsersync.init({
			proxy: 'http://' + path.basename(__dirname) + '.dev'
		});
	} else {
		handle.generic.log('Not in Devsites - skipping BrowserSync', {type: 'bad', pipe: false});
	}

	watch('themes/' + pkg.name + '/scss/**/*.scss', function() {
		gulp.start('css');
	});

	watch('themes/' + pkg.name + '/js/src/*.js', function() {
		gulp.start('js');
	});

	watch('themes/' + pkg.name + '/images/src/**/*.png', function() {
		gulp.start('png');
	});
});
