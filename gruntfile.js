module.exports = function (grunt) {
    grunt.initConfig({

        // define source files and their destinations
        uglify: {
            files: { 
                src: 'Public/js/*.js',  // source files mask
                dest: 'Public/jsm/',    // destination folder
                expand: true,    // allow dynamic building
                flatten: true,   // remove all unnecessary nesting
                ext: '.min.js'   // replace .js to .min.js
            }
        },
        cssmin: {
            target: {
                files: [{
                expand: true,
                cwd: 'Public/css',
                src: ['*.css', '!*.min.css'],
                dest: 'Public/cssm',
                ext: '.min.css'
                }]
            }
        },
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeTagWhitespace: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                    minifyJS: true,
                },
                files: {                                                // Dictionary of files
                    'Public/index.min.html': 'Public/index.html',     // 'destination': 'source'
                }
            },
        },
        watch: {
            js:  { files: 'Public/js/*.js', tasks: [ 'newer:uglify' ] },
            css: {files: 'Public/css/*.css', tasks: ['newer:cssmin']},
            html: {files: 'Public/index.html', tasks: ['newer:htmlmin']}
        },
    });

    // load plugins
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');


    // register at least this one task
    grunt.registerTask('default', [ 'newer:uglify', 'newer:cssmin', 'newer:htmlmin' ]);


};