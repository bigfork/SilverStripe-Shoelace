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
				title: 'Local',
				database: '<%= pkg.sql.name %>',
				user: '<%= bf_conf.sql.local.user %>',
				pass: '<%= bf_conf.sql.local.pass %>',
				host: '<%= pkg.sql.host %>'
			},
			test: {
				title: 'Megafork - Test',
				database: '<%= pkg.sql.name %>',
				type: 'test',
				user: '<%= bf_conf.sql.remote.user %>',
				pass: '<%= bf_conf.sql.remote.pass %>',
				host: '127.0.0.1',
				ssh_host: '<%= bf_conf.ssh.user %>@<%= bf_conf.ssh.host %>'
			},
			live: {
				title: 'Megafork - Live',
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
			megafork: {
				host: '<%= bf_conf.ssh.host %>',
				username: '<%= bf_conf.ssh.user %>',
				privateKey: grunt.file.read(process.env['HOME'] + '/.ssh/id_rsa')
			}
		},
		sshexec: {
			test: {
				command: 'echo {{GITREPO}}',
				options: {
					config: 'megafork'
				}
			},
			deploy_live: {
				command: [
					'cd /home/www/vhosts/live/{{DIR}}',
					'git init',
					'git remote add origin {{GITREPO}}',
					'git pull origin master',
					'composer install'
				].join(' && '),
				options: {
					config: 'megafork'
				}
			},
			deploy_test: {
				command: [
					'cd /home/www/vhosts/test/{{DIR}}',
					'git init',
					'git remote add origin {{GITREPO}}',
					'git pull origin master',
					'composer install'
				].join(' && '),
				options: {
					config: 'megafork'
				}
			},
			update_live: {
				command: [
					'cd /home/www/vhosts/live/{{DIR}}',
					'git pull origin master'
				].join(' && '),
				options: {
					config: 'megafork'
				}
			},
			update_test: {
				command: [
					'cd /home/www/vhosts/test/{{DIR}}',
					'git pull origin master'
				].join(' && '),
				options: {
					config: 'megafork'
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
	grunt.registerTask('deploy', function(type, dir) {
		if(!type || !dir) {
			return;
		}
		var shell = require('shelljs');

		var gitremote = shell.exec('git --git-dir=.git config --get remote.origin.url', {silent: true}).output.trim();

		var orig = grunt.config.get('sshexec.deploy_' + type + '.command');
		orig = orig.replace('{{DIR}}', dir);
		orig = orig.replace('{{GITREPO}}', gitremote);

		grunt.config.set('sshexec.deploy_' + type + '.command', orig);
		grunt.task.run('sshexec:deploy_' + type);
		shell.exec('grunt db_push --target="' + type + '"', {silent:true});
	});
	grunt.registerTask('update', function(type, dir) {
		if(!type || !dir) {
			return;
		}
		var shell = require('shelljs');

		var orig = grunt.config.get('sshexec.update_' + type + '.command');
		orig = orig.replace('{{DIR}}', dir);

		grunt.config.set('sshexec.update_' + type + '.command', orig);
		grunt.task.run('sshexec:update_' + type);
		shell.exec('grunt db_push --target="' + type + '"', {silent:true});
	});
};
