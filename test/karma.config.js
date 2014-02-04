module.exports = function(config) {
	config.set({

		files: [
			'src/reporter.js',
			'src/mutation.js',
			'src/parser.js',
			'src/meg.js',
			'test/unit/**/*.spec.js'
		],

		basePath: '../',
		frameworks: ['jasmine'],
		reporters: ['progress'],
		browsers: ['Chrome'],
		autoWatch: false,
		singleRun: true,
		colors: true
	});
};
