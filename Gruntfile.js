module.exports = function(grunt){

	grunt.initConfig({
		jshint: {
			all: ['src/**/*.js'],
			options:{
                "strict": true,
                "curly": true,
                "eqnull": true,
                "eqeqeq": true,
                "undef": true,
				globals: {
					_: false,
					$: false,
                    jasmine: false,
                    describe: false,
                    expect: false,
                    beforeEach: false,
                    define: false
				},
				browser: true,
				devel: true
			}
		},
        testem: {
            unit: {
                options: {
                    framework: 'jasmine2',
                    launch_in_dev: ['Chrome'],
                    before_tests: 'grunt jshint',
                    serve_files: [
                        'src/**/*.js',
                        'test/**/*.js'
                    ],
                    watch_files: [
                        'src/**/*.js',
                        'test/**/*.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                }
            },
            build: {
                files: {
                    'build/frame-zoomer.min.js': ['src/frame-zoomer.js']
                }
            }
        }
	});
	
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-testem');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['testem:run:unit']);
}