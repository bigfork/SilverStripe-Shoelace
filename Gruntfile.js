module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// get your own passwords!
		bf_conf: grunt.file.readJSON(process.env['HOME'] + '/bigfork.json'),

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
					style: 'compressed'
				},
				files: {
					'themes/<%= pkg.name %>/css/style.css' : 'themes/<%= pkg.name %>/scss/style.scss',
					'themes/<%= pkg.name %>/css/style_ie8.css' : 'themes/<%= pkg.name %>/scss/style_ie8.scss',
					'themes/<%= pkg.name %>/css/editor.css' : 'themes/<%= pkg.name %>/scss/editor.scss'
				}
			}
		},

		// scss lint
		scsslint: {
			files: [
				'themes/<%= pkg.name %>/scss/**/*.scss'
			],
			options: {
				exclude: [
					'themes/<%= pkg.name %>/scss/includes/_reset.scss',
					'themes/<%= pkg.name %>/scss/includes/_normalize.scss'
				]
			}
		},

		// combine media queries
		combine_mq: {
			options: {
				log: false,
				minify: true
			},
			main: {
				files: {
					'themes/<%= pkg.name %>/css/style.css': 'themes/<%= pkg.name %>/css/style.css'
				}
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
					'themes/<%= pkg.name %>/css/style_ie8.css' : 'themes/<%= pkg.name %>/css/style_ie8.css',
					'themes/<%= pkg.name %>/css/editor.css' : 'themes/<%= pkg.name %>/css/editor.css'
				}
			}
		},

		// watch tasks
		watch: {
			uglify: {
				files: 'themes/<%= pkg.name %>/js/src/app.js',
				tasks: ['js', 'notify'],
				options: {
					spawn: false,
					interrupt: true,
					debounceDelay: 250
				}
			},
			css: {
				files: 'themes/<%= pkg.name %>/scss/**/*.scss',
				tasks: ['css', 'notify'],
				options: {
					spawn: false,
					interrupt: true,
					debounceDelay: 250
				}
			}
		},

		// notifications
		notify: {
			watch: {
				options: {
					title: 'Grunt',
					message: 'Tasks complete',
				}
			}
		}

	});

	// Task(s).
	grunt.registerTask('js',  ['jshint', 'uglify']);
	grunt.registerTask('css',  ['scsslint', 'sass', 'autoprefixer', 'combine_mq']);
	grunt.registerTask('png',  ['tinypng']);
	grunt.registerTask('default', ['js', 'css']);
	
	// On watch events, configure scsslint to only run on changed file
	grunt.event.on('watch', function(action, filepath, target) {
		if(target === 'css') {
			grunt.config('scsslint.files', filepath);
		}
	});
};
