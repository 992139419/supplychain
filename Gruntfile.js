module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        directory: {
            app: 'public/material/new',
            dist: 'public'
        },

        watch: {
            css: {
                files: [
                    '<%= directory.app %>/css/*.css'
                ],
                tasks: ['sass:dev', 'copy:styles'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            includeTpl: {
                files: ['<%= directory.app %>/**/*.html'],
                tasks: ['includereplace'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            configFiles: {
                files: ['Gruntfile.js'],
                options: {
                    reload: true
                }
            }
        },

        includereplace: {
            dynamic_mappings: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        src: [
                            '<%= directory.app %>/**/*.html',
                            '!<%= directory.app %>/formation/*.html'
                        ],
                        dest: '<%= directory.dist %>',
                        flatten: true
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-include-replace');

    grunt.registerTask('default', ['includereplace']);
    grunt.registerTask('watchfiles', ['watch']);
    //grunt.registerTask('removecss', ['uncss']);
};