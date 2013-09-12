module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

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

		// concatenate and uglify javascript
		uglify: {
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
					style: 'compact'
				},
				files: {
					'themes/<%= pkg.name %>/css/style.css' : 'themes/<%= pkg.name %>/scss/style.scss',
					'themes/<%= pkg.name %>/css/editor.css' : 'themes/<%= pkg.name %>/scss/editor.scss'
				}
			}
		},

		// watch tasks
		watch: {
			uglify: {
				files: 'themes/<%= pkg.name %>/js/src/app.js',
				tasks: ['jshint', 'uglify']
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

	// Plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-notify');

	// Task(s).
	grunt.registerTask('default', ['jshint', 'uglify', 'sass']);

};