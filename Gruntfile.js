module.exports = function(grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// get your own passwords!
		bf_conf: grunt.file.readJSON(process.env['HOME'] + '/bigfork.json'),

		// sql deployment
		deployments: {
			options: {
				backups_dir: '../.sqlbackups'
			},
			local: {
				title: 'Bigfork local',
				database: '<%= pkg.sql.name %>',
				user: '<%= bf_conf.sql.local.user %>',
				pass: '<%= bf_conf.sql.local.pass %>',
				host: '<%= pkg.sql.host %>'
			},
			test: {
				title: 'Bigfork remote - Test',
				database: '<%= pkg.sql.name %>',
				type: 'test',
				user: '<%= bf_conf.sql.remote.user %>',
				pass: '<%= bf_conf.sql.remote.pass %>',
				host: '127.0.0.1',
				ssh_host: '<%= bf_conf.ssh.user %>@<%= bf_conf.ssh.host %>'
			},
			live: {
				title: 'Bigfork remote - Live',
				database: '<%= pkg.sql.name %>_live',
				type: 'live',
				user: '<%= bf_conf.sql.remote.user %>',
				pass: '<%= bf_conf.sql.remote.pass %>',
				host: '127.0.0.1',
				ssh_host: '<%= bf_conf.ssh.user %>@<%= bf_conf.ssh.host %>'
			}
		},

		// ssh deployment
		sshconfig: {
			bigfork: {
				host: '<%= bf_conf.ssh.host %>',
				username: '<%= bf_conf.ssh.user %>',
				privateKey: grunt.file.read(process.env['HOME'] + '/.ssh/id_rsa')
			}
		},
		sshexec: {
			deploy: {
				command: [
					'cd /home/www/vhosts/{{TYPE}}/{{DIR}}',
					'git init',
					'git remote add origin {{GITREPO}}',
					'git pull origin master',
					'composer install'
				].join(' && '),
				options: {
					config: 'bigfork'
				}
			},
			update: {
				command: [
					'cd /home/www/vhosts/{{TYPE}}/{{DIR}}',
					'git pull origin master'
				].join(' && '),
				options: {
					config: 'bigfork'
				}
			}
		},

		// compress pngs
		tinypng: {
			options: {
				apiKey: '<%= bf_conf.tinypng %>',
				summarize: true,
				showProgress: true,
				stopOnImageError: true,
				checkSigs: true,
				sigFile: 'themes/<%= pkg.name %>/images/.tinypng-sigs'
			},
			compress: {
				expand: true,
				cwd:  'themes/<%= pkg.name %>/images/src/',
				src:  '**/*.png',
				dest: 'themes/<%= pkg.name %>/images/'
			}
		},

		// lint javascript
		jshint: {
			options: {
				globals: {
					"jQuery": true
				},
				force: true
			},
			all: ['themes/<%= pkg.name %>/js/src/app.js']
		},

		// banner tag
		tag: {
			banner: '/*!\n' +
				' * <%= pkg.description %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * (c) <%= pkg.author %> ' + new Date().getFullYear() + '.\n' +
				' */\n'
		},

		// concatenate and uglify javascript
		uglify: {
			options: {
				preserveComments: false,
				banner: '<%= tag.banner %>'
			},
			dist: {
				files: {
					'themes/<%= pkg.name %>/js/app.min.js' : ['themes/<%= pkg.name %>/js/src/app.js']
				}
			}
		},

		// compile scss into css
		sass: {
			dist: {
				options: {
					style: 'compressed',
					banner: '<%= tag.banner %>'
				},
				files: {
					'themes/<%= pkg.name %>/css/style.css' : 'themes/<%= pkg.name %>/scss/style.scss',
					'themes/<%= pkg.name %>/css/editor.css' : 'themes/<%= pkg.name %>/scss/editor.scss',
					'themes/<%= pkg.name %>/css/ie8.css' : 'themes/<%= pkg.name %>/scss/ie8.scss'
				}
			}
		},

		// scss lint
		scsslint: {
			files: [
				'themes/<%= pkg.name %>/scss/*.scss'
			],
			options: {
				exclude: [
					'themes/<%= pkg.name %>/scss/_reset.scss',
					'themes/<%= pkg.name %>/scss/_normalize.scss'
				]
			}
		},

		// add vendor prefixes
		autoprefixer: {
			dist: {
				options: {
					browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.1']
				},
				files: {
					'themes/<%= pkg.name %>/css/style.css' : 'themes/<%= pkg.name %>/css/style.css',
					'themes/<%= pkg.name %>/css/editor.css' : 'themes/<%= pkg.name %>/css/editor.css',
					'themes/<%= pkg.name %>/css/ie8.css' : 'themes/<%= pkg.name %>/css/ie8.css'
				}
			}
		},

		// watch tasks
		watch: {
			uglify: {
				files: 'themes/<%= pkg.name %>/js/src/app.js',
				tasks: ['js']
			},
			sass: {
				files: 'themes/<%= pkg.name %>/scss/*.scss',
				tasks: ['sass']
			},
			notify: {
				files: ['<%= watch.uglify.files %>', '<%= watch.sass.files %>'],
				tasks: ['notify']
			}
		},

		// notifications
		notify: {
			watch: {
				options: {
					title: 'Grunt',
					message: 'Tasks complete',
				}
			},
		}

	});

	// Task(s).
	grunt.registerTask('js',  ['jshint', 'uglify']);
	grunt.registerTask('css',  ['scsslint', 'sass', 'autoprefixer']);
	grunt.registerTask('png',  ['tinypng']);
	grunt.registerTask('default', ['js', 'css']);
	grunt.registerTask('deploy', function(type, dir, db, update) {
		if(!type || !dir) {
			grunt.log.writeln('Please specify valid arguments.');
			return;
		}
		if(type != 'live' && type != 'test') {
			grunt.log.writeln('Please specify either \'live\' or \'test\' as the directory.');
			return;
		}
		if(!db) {
			db = false;
		} else if(db == 'true') {
			db = true;
		}
		if(!update) {
			update = false;
		} else if(update == 'true') {
			update = true;
		}

		var shell = require('shelljs');

		var gitremote;
		if(!update) {
			gitremote = shell.exec('git --git-dir=.git config --get remote.origin.url', {silent: true}).output.trim();
			if(gitremote.indexOf('CleanInstall') > -1) {
				grunt.log.writeln('Please change the remote origin from default: \'' + gitremote + '\'');
				return;
			}
		}

		var command;
		if(!update) {
			command = 'sshexec.deploy';
		} else {
			command = 'sshexec.update';
		}

		var orig = grunt.config.get(command + '.command');
		orig = orig.replace('{{TYPE}}', type);
		orig = orig.replace('{{DIR}}', dir);
		if(!update) {
			orig = orig.replace('{{GITREPO}}', gitremote);
		}

		grunt.config.set(command + '.command', orig);
		grunt.task.run(command);
		if(db === true) {
			shell.exec('grunt db_push --target="' + type + '"', {silent:true});
		}
	});
};
