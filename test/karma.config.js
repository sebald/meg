module.exports = function(config) {
	config.set({

		files: ['src/**/*.js'],

		basePath: '../',
		frameworks: ['jasmine'],
		reporters: ['progress'],
		browsers: ['Chrome'],
		autoWatch: false,
		singleRun: true,
		colors: true
	});
};
