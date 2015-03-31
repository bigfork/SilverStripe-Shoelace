var gulp = require('gulp'),
	p = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'gulp.*'],
		replaceString: /\bgulp[\-.]/,
		rename: {
			'gulp-combine-mq': 'cmq',
			'gulp-util': 'gutil'
		}
	}),
	pkg = require('./package.json'),
	conf = require(process.env['HOME'] + '/bigfork.json'),

	// options!
	opt = {
		scss_lint: {
			src: ['themes/' + pkg.name + '/scss/**/!(_reset|_normalize)*.scss']
		},
		css: {
			src: [
				'themes/' + pkg.name + '/scss/style*.scss',
				'themes/' + pkg.name + '/scss/editor.scss'
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

var config = function(name) {
	return opt[name.replace('-', '_')];
},

lint = {
	log: function(file) {
		var errorCount = file.scsslint.errorCount,
			plural = errorCount === 1 ? '' : 's',
			output = '';

		file.scsslint.results.forEach(function(result) {
			var msg =
				p.gutil.colors.cyan(file.path) + ':' +
				p.gutil.colors.red(result.line) + ' ' +
				('error' === result.severity ? p.gutil.colors.red('[E]') : p.gutil.colors.cyan('[W]')) + ' ' +
				result.reason;
			output += msg;
		});
		setTimeout(function() {
			p.gutil.log(output);
		}, 0);
	},
	error: function(file) {
		var error;
		if (file.scsslint && !file.scsslint.success) {
			error = new p.gutil.PluginError('scss-lint', 'scss-lint failed');
		}
		p.gutil.beep();
		return error;
	}
};

// lint css
gulp.task('scss-lint', function() {
	var conf = config('scss-lint');
	return gulp.src(conf.src)
		.pipe(p.scsslint('.scss-lint.yml'))
		.pipe(p.scsslint.reporter(lint.log))
		.pipe(p.scsslint.reporter(lint.error))
});

// compile scss into css
gulp.task('css', ['scss-lint'], function() {
	var conf = config('css');
	return gulp.src(conf.src)
		.pipe(p.sass())
		.pipe(p.autoprefixer({
			browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.1']
		}))
		.pipe(p.cmq())
		.pipe(p.cssmin())
		.pipe(gulp.dest(conf.dest));
});

// lint, concat and uglify javascript
gulp.task('js', function() {
	var conf = config('js');
	return gulp.src(conf.src)
		.pipe(p.jshint())
		.pipe(p.concat('app.min.js'))
		.pipe(p.uglify())
		.pipe(gulp.dest(conf.dest));
});

// compress pngs
gulp.task('png', function() {
	var conf = config('png');
	return gulp.src(conf.src)
		.pipe(p.tinypng(conf.tinypng))
		.pipe(gulp.dest(conf.dest));
});

gulp.task('default', function() {
	gulp.start(['css', 'js']);
});

// watch tasks
gulp.watch('themes/' + pkg.name + '/scss/**/*.scss', function() {
	gulp.start('css');
});

gulp.watch('themes/' + pkg.name + '/js/src/*.js', function() {
	gulp.start('js');
});
