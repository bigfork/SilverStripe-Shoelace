var path = require('path'),
	pkg = require('../../package.json'),

	p = {
		gutil: require('gulp-util'),
		notify: require('gulp-notify')
	};

/* notify */

notify = {
	opts: function(message, success, opts) {
		opts = (opts ? opts : {});
		p.notify.logLevel(0);
		return {
			title: 'Task ' + (success !== false ? 'complete' : 'failed'),
			subtitle: pkg.description,
			message: message,
			onLast: opts.onLast ? opts.onLast : true,
			logLevel: 0,
			icon: path.resolve(__dirname, '../', 'assets', 'fork.png')
		};
	},
	show: function(message, success, opts) {
		return p.notify(this.opts(message, success, opts));
	},
	error: function(err, message) {
		if(!message) message = '<%= error.message %>';
		return p.notify.onError(notify.opts(message, false, {}))(err);
	}
},

/* SCSS lint handler */

lint = {
	error: function(file) {
		var errorCount = file.scsslint.errorCount,
			plural = errorCount === 1 ? '' : 's',
			error,
			files = [];

		file.scsslint.results.forEach(function(result) {
			var base = path.basename(file.path),
				c = p.gutil.colors;

			files.indexOf(base) < 0 && files.push(base);

			p.gutil.log(c.red('✘ ') + c.cyan(file.path.replace(path.resolve(__dirname, '../../'), '')) + ':' +
				c.red(result.line) + ' ' +
				('error' === result.severity ? c.red('[E]') : c.cyan('[W]')) + ' ' +
				result.reason);
		});

		if(files) {
			p.gutil.beep();
			error = new p.gutil.PluginError('scss-lint', 'SCSS lint failed for ' + files.join(', '));

			notify.error(error);

			return error;
		}
	}
},

/* everything else handler */

generic = {
	error: function(err) {
		var c = p.gutil.colors,
			msg = function(file) {
				return c.cyan(file) + ':' +
					c.red(err.lineNumber) + ' ' + err.message;
			},

			relPath = path.resolve(__dirname, '../../'),
			alert = {};

		if(err.fileName) err.file = err.fileName; // standardise

		if(err.file) {
			alert = {
				message: msg(err.file.replace(relPath, '')).replace(err.file, ''),
				notify: path.basename(err.file) + ':<%= error.lineNumber %> <%= error.message %>'
			};
		} else {
			alert = {
				message: err.message,
				notify: '<%= error.message %>'
			};
		}

		p.gutil.log(c.red('✘ ') + alert.message);
		p.gutil.beep();

		notify.error(err, alert.notify);

		this.emit('end');
	}
};

module.exports = {
	notify: notify,
	lint: lint,
	generic: generic
};
