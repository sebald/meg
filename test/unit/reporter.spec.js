describe( '[reporter.js]', function () {
	var reporter;

	beforeEach( function () {
		reporter = new Reporter();
	});


	// Initialization
	// -------------------------
	describe( 'Initialization', function () {
		it('should be defined', function () {
			expect(Reporter).toBeDefined();
			expect(typeof Reporter).toEqual( 'function' );
		});

		it('should be possible to create a factory instance', function () {
			expect(reporter).toBeDefined();
		});

		it('should have a function to report a failure', function () {
			expect(typeof reporter.snitch).toEqual( 'function' );
		});

		it('should have a function to print message', function () {
			expect(typeof reporter.getMessage).toEqual( 'function' );
		});

		it('should be possible to set a error prefix', function () {
			var r = new Reporter( 'FOO' );
			expect(r.prefix).toEqual( 'FOO' );
		});

		it('should set maxFailsPos to 0 on init', function () {
			expect(reporter.maxFailPos).toEqual( 0 );
		});

		it('should have no failures stored on init', function () {
			expect(reporter.failure).toEqual( {} );
		});
	});


	// Set
	// -------------------------
	describe('Set Failure', function () {
		it('should store and report latest failures', function () {
			reporter.snitch( 'treasure', 'trash', 5 );
			expect(reporter.failure).not.toEqual( {} );
		});

		it('should only update if a the new failure occurs later (in the input string)', function () {
			reporter.snitch( 'treasure', 'trash', 1 );

			expect(reporter.failure.expected).toEqual( 'treasure' );
			expect(reporter.failure.found).toEqual( 'trash' );
			expect(reporter.maxFailPos).toEqual( 1 );

			reporter.snitch( 'apples', 'oranges', 2 );

			expect(reporter.failure.expected).toEqual( 'apples' );
			expect(reporter.failure.found).toEqual( 'oranges' );
			expect(reporter.maxFailPos).toEqual( 2 );

			reporter.snitch( 'nobody', 'cares', 1 );

			expect(reporter.failure.expected).toEqual( 'apples' );
			expect(reporter.failure.found).toEqual( 'oranges' );
			expect(reporter.maxFailPos).toEqual( 2 );
		})
	});


	// Reset
	// -------------------------
	describe('Reset', function () {
		it('should be possible to reset the reporter', function () {
			reporter.snitch( 'apples', 'oranges', 2 );
			reporter.reset();

			expect(reporter.failure).toEqual( {} );
			expect(reporter.maxFailPos).toEqual( 0 );
		});
	});


	// Get Failure
	// -------------------------
	describe('Get Failure', function () {
		it('should create a message with the latest failure', function () {
			reporter.snitch( 'apples', 'oranges', 2 );
			expect(reporter.getMessage()).toEqual('ERROR: Expected apples but found "oranges" @ 2.');
		});
	});
});
