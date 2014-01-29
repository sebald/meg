describe('[mutation.js]', function () {
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
				start: '',
				close: ''
			},
			mutation;

		it('should be possible to create a mutation', function () {
			mutation = factory.createMutation( options );
			expect(mutation.constructor.name).toBe( 'Mutation' );
		});

		it('should be possible to create a mutation with an expression and a replacement', function () {
			var exp = /foo/,
				start = 'start',
				close = 'close';

			options = { exp: exp, start: start, close: close };
			mutation = factory.createMutation( options );

			expect(mutation.exp).toEqual( exp );
			expect(mutation.start).toEqual( start );
			expect(mutation.close).toEqual( close );
		});

		it('should expose a mutation fuction', function () {
			mutation = factory.createMutation( options );
			expect(typeof mutation.mutate).toEqual( 'function' );
		});

		it('should be possible to mutate a string', function () {
			options = {
				exp: /strong|b/,
				start: '**',
				close: '**'
			};
			mutation = factory.createMutation( options );

			expect(mutation.mutate('strong', 'I am strong!')).toBe('**I am strong!**');
			expect(mutation.mutate('b', 'I am strong!')).toBe('**I am strong!**');

			options = {
				exp: /div|p/,
				start: '',
				close: '\n'
			};
			mutation = factory.createMutation( options );

			expect(mutation.mutate('div', 'I am a paragraph!')).toBe('I am a paragraph!\n');
			expect(mutation.mutate('p', 'I am a paragraph!')).toBe('I am a paragraph!\n');
		});

		it('should return "null" when there is nothing to mutate', function () {
			options = {
				exp: /strong|b/,
				start: '**',
				close: '**'
			};
			mutation = factory.createMutation( options );
			expect(mutation.mutate('foo', 'I am not so strong!')).toBe( null );
			expect(mutation.mutate('', 'I am not so strong!')).toBe( null );
		});
	});
});
