describe('[parser.js]', function () {
	var factory;

	// ParserFactory
	// -------------------------
	describe('ParserFactory:', function () {
		beforeEach( function () {
			factory = new ParserFactory();
		});

		it('should expose itself', function () {
			expect(factory).toBeDefined();
		});

		it('should have function to create a parser', function () {
			expect(typeof factory.createParser).toEqual( 'function' );
		});
	});


	// Parser
	// -------------------------
	describe('Parser', function () {
		var parser;

		beforeEach( function () {
			parser = factory.createParser();
		});

		it('should be possible to create a parser', function () {
			expect(parser.constructor.name).toBe( 'Parser' );
		});

		it('should have a function to parse HTML to markdown', function () {
			expect(typeof parser.fromHTML).toEqual( 'function' );
		});


		// Parse HTML to Markdown
		// -------------------------
		describe('Parse HTML to Markdown', function () {
			it('should parse a single string to a paragraph', function () {
				expect(parser.fromHTML( 'This is a paragraph!' )).toEqual('This is a paragraph!');
				expect(parser.fromHTML( 'This is another text!' )).toEqual('This is another text!');
			});

			// it('should parse simple <div>s to paragraphs', function () {
			// 	expect(parser.fromHTML( '<div>This is a paragraph!</div>' )).toEqual('This is a paragraph!');
			// });
		});
	});

});
