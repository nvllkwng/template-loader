/*global module*/
module.exports = function(grunt) {
	'use strict';
	var gruntConfig = grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});
	
    gruntConfig.jslint = {
        client: {
            src: ['src/*.js', 'Gruntfile.js'],
            directives: {
                browser: true,
                unparam: true,
                todo: true,
                debug: true,
                white: true
            }
        }
    };
    
    gruntConfig.uglify = {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        dist: {
            files: {
              'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
            }
        }
    };
    
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['jslint', 'uglify']);
};