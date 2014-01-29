'use strict';

module.exports = function (grunt) {


	// Load Tasks.
	// -------------------------
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	// Config.
	// -------------------------
	grunt.initConfig({


		// Globals
		// -------------------------
		pkg: grunt.file.readJSON('package.json'),
		dir:{
			dist: 'dist',
			src: 'src',
			spec: 'test/unit'
		},
		files: {
			src: [
				'<%= dir.src %>/mep.js'
			],
			spec: '<%= dir.spec %>/**/*.spec.js'
		},
		banner: [
			'/*!',
			' * mep.js v<%= pkg.version %>',
			' * <%= pkg.homepage %>',
			' * Copyright 2014 Sebastian Sebald; Licensed MIT',
			' */\n\n'
		].join('\n'),


		// Shell Helper
		// -------------------------
		shell: {
			options: {
				stdout: true
			},
			npm_install: {
				command: 'npm install'
			},
			bower_install: {
				command: 'node ./node_modules/bower/bin/bower install'
			}
		},


		// Build Tasks
		// -------------------------
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			src: ['<%= files.src %>'],
			tests: ['<%= files.spec %>'],
			gruntfile: ['Gruntfile.js']
		},

		uglify: {
			options: {
				banner: '<%= banner %>',
				enclose: {
					'window': 'window'
				}
			},
			src: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				src: ['<%= files.src %>'],
				dest: '<%= dir.dist %>/mep.js'
			},
			min: {
				options: {
					mangle: true,
					compress: true
				},
				src: ['<%= files.src %>'],
				dest: '<%= dir.dist %>/mep.min.js'
			}
		},

		clean: {
			dist: 'dist'
		},


		// Testing
		// -------------------------
		karma: {
			single: {
				configFile: 'test/karma.config.js'
			},
			auto: {
				configFile: 'test/karma.config.js',
				autoWatch: true,
				singleRun: false
			}
		}
	});

	// Aliases
	// -------------------------
	grunt.registerTask('update', ['shell:npm_install','shell:bower_install','shell:protractor_install']);
	grunt.registerTask('dev', ['clean:dist', 'jshint', 'uglify:src']);
	grunt.registerTask('release', ['dev', 'uglify:min']);
	grunt.registerTask('test', ['karma:single']);
	grunt.registerTask('tdd', ['karma:auto']);

	grunt.registerTask('default', ['release']);

};
