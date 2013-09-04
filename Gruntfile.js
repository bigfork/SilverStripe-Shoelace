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
			all: ['themes/*/js/src/app.js']
		},

		// concatenate and uglify javascript
		uglify: {
			dist: {
				files: grunt.file.expandMapping(
					'themes/*/js/src/app.js',
					'themes/*/js/app.min.js',
					{
						rename: function(destBase, destPath) {
							return destPath.replace(/\/js\/src\/app\.js$/, "/js/app.min.js");
						}
					}
				)
			}
		},

		// compile scss into css
		sass: {
			dist: {
				destination: process.env.DEST,
				options: {
					style: 'compact'
				},
				files: grunt.file.expandMapping(
					[
						'themes/*/scss/style.scss',
						'themes/*/scss/editor.scss'
					],
					'themes/*/css/style.css',
					{
						rename: function(destBase, destPath) {
							return destPath.replace(/\/scss\/(\w+)\.scss$/, "/css/$1.css");
						}
					}
				)
			}
		},

		// watch tasks for uglify and scss
		watch: {
			js: {
				files: 'themes/*/js/src/app.js',
				tasks: ['jshint', 'uglify']
			},
			sass: {
				files: 'themes/*/scss/*.scss',
				tasks: ['sass']
			}
		}
	});

	// Plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-notify');

	grunt.task.run('notify_hooks');

	// Task(s).
	grunt.registerTask('default', ['jshint', 'uglify', 'sass']);

};