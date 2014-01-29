ddescribe('[mutation.js]', function () {
	var factory;

	// MutationFactory
	// -------------------------
	describe('MutationFactory', function () {
		beforeEach( function () {
			factory = new MutationFactory();
		});

		it('should be defined', function () {
			expect(MutationFactory).toBeDefined();
			expect(typeof MutationFactory).toEqual( 'function' );
		});

		it('should be possible to create a factory instance', function () {
			expect(factory).toBeDefined();
		});

		it('should have a function to create a new mutation', function () {
			expect(typeof factory.createMutation).toEqual( 'function' );
		});
	});


	// Mutation
	// -------------------------
	describe('Mutation', function () {
		var options = {
				exp: /.*/,
				action: function () {}
			},
			mutation;

		it('should be possible to create a mutation', function () {
			mutation = factory.createMutation( options );
			expect(mutation.constructor.name).toBe( 'Mutation' );
		});

		it('should be possible to create a mutation with an expression and an action', function () {
			var exp = /foo/,
				fn = function () {};

			options = { exp: exp, action: fn };
			mutation = factory.createMutation( options );

			expect(mutation.exp).toEqual( exp );
			expect(mutation.action).toEqual( fn );
		});

		it('should expose a mutation fuction', function () {
			mutation = factory.createMutation( options );
			expect(typeof mutation.mutate).toEqual( 'function' );
		});

		it('should be possible to mutate a string', function () {
			options = {
				exp: /[aeiou]/g,
				action: function ( s ) {
					return s.replace(this.exp, '*');
				}
			};
			mutation = factory.createMutation( options );
			expect(mutation.mutate('Hello World')).toBe('H*ll* W*rld');

			options = {
				exp: /<\/?strong>/g,
				action: function ( s ) {
					return s.replace(this.exp, '**');
				}
			};
			mutation = factory.createMutation( options );
			expect(mutation.mutate('<strong>I am strong!</strong>')).toBe('**I am strong!**');
		});

		it('should return "null" when there is nothing to mutate', function () {
			options = {
				exp: /<\/?strong>/g,
				action: function ( s ) {
					return s.replace(this.exp, '**');
				}
			};
			mutation = factory.createMutation( options );
			expect(mutation.mutate('I am not so strong!')).toBe( null );
		});
	});
});
