const gulp = require('gulp');
const bigfork = require(process.env.HOME + '/bigfork.json');
const path = require('path');
const handle = require('./handlers');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const watch = require('gulp-watch');
const browsersync = require('browser-sync').create();
const scsslint = require('gulp-scss-lint');
const sass = require('gulp-sass');
const autoprefix = require('gulp-autoprefixer');
const cmq = require('gulp-combine-mq');
const cssglob = require('gulp-css-globbing');
const cssnano = require('gulp-cssnano');
const jshint  = require('gulp-jshint');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const tinypng = require('gulp-tinypng-compress');

const opt = {
	scsslint: {
		src: ['scss/**/!(_reset|_normalize)*.scss']
	},
	css: {
		src: [
			'scss/editor.scss',
			'scss/style*.scss'
		],
		dest: 'css/'
	},
	png: {
		src: ['images/src/**/*.png'],
		dest: 'images/'
	},
	js: {
		src: 'js/src/*.js',
		dest: 'js/'
	}
};

// lint css
gulp.task('scss-lint', function() {
	return gulp.src(opt.scsslint.src)
		.pipe(scsslint({
			'config': '.scss-lint.yml',
			'customReport': handle.lintReporter
		}));
});

// compile scss into css
gulp.task('css', ['scss-lint'], function() {
	return gulp.src(opt.css.src)
		.pipe(cssglob({
			extensions: ['.scss']
		}))
		.pipe(sass().on('error', handle.sassReporter))
		.pipe(autoprefix({
			browsers: ['ie >= 8', 'safari >= 8', '> 1%']
		}))
		.pipe(cmq())
		.pipe(cssnano({
			autoprefixer: false,
			mergeRules: true,
			reduceIdents: {
				keyframes: false
			},
			zindex: false
		}))
		.pipe(handle.notify('CSS compiled - <%= file.relative %>'))
		.pipe(handle.pipeLog('compiled'))
		.pipe(gulp.dest(opt.css.dest))
		.pipe(browsersync.stream());
});

// lint, concat and uglify javascript
gulp.task('js', function() {
	glob(opt.js.src, function(err, files) {
		files.map(function(entry) {
			return browserify(entry).bundle()
				.on('error', handle.genericReporter)
				.pipe(plumber({errorHandler: handle.genericReporter}))
				.pipe(source(path.basename(entry).replace(/\.js$/, '.min.js')))
				.pipe(buffer())
				.pipe(jshint({
					esnext: true
				}))
				.pipe(babel({
					presets: ['es2015']
				}))
				.pipe(uglify())
				.pipe(handle.notify('JS compiled - <%= file.relative %>'))
				.pipe(handle.pipeLog('compiled'))
				.pipe(gulp.dest(opt.js.dest));
		})
	});
});

// compress pngs
gulp.task('png', function() {
	return gulp.src(opt.png.src)
		.pipe(plumber({errorHandler: handle.genericReporter}))
		.pipe(tinypng({
			key: bigfork.tinypng,
			checkSigs: true,
			sigFile: 'images/.tinypng-sigs'
		}))
		.pipe(handle.pipeLog('compressed'))
		.pipe(handle.notify('Images compressed'))
		.pipe(gulp.dest(opt.png.dest));
});

gulp.task('default', function() {
	gulp.start(['css', 'js']);
});

// watch tasks
gulp.task('watch', function() {
	var sitepath = path.join(__dirname, '/../../'),
		parent = path.basename(path.join(sitepath, '../'));

	if(parent == 'Devsites') {
		browsersync.init({
			proxy: 'http://' + path.basename(sitepath) + '.dev'
		});
	} else {
		handle.log('Not in Devsites - skipping BrowserSync', {type: 'bad'});
	}

	watch('scss/**/*.scss', function() {
		gulp.start('css');
	});

	watch('js/src/*.js', function() {
		gulp.start('js');
	});

	watch('images/src/**/*.png', function() {
		gulp.start('png');
	});
});
