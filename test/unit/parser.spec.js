describe('[parser.js]', function () {
	var factory;

	// ParserFactory
	// -------------------------
	describe('ParserFactory:', function () {
		beforeEach( function () {
			factory = new ParserFactory();
		});

		it('should be defined', function () {
			expect(ParserFactory).toBeDefined();
			expect(typeof ParserFactory).toEqual( 'function' );
		});

		it('should be possible to create a factory instance', function () {
			expect(factory).toBeDefined();
		});

		it('should have a function to create a new parser', function () {
			expect(typeof factory.createParser).toEqual( 'function' );
		});

		it('should create a parser', function () {
			var parser = factory.createParser();
			expect(parser.constructor.name).toBe( 'Parser' );
		});
	});


	// Parser
	// -------------------------
	describe('Parser', function () {
		var parser;

		beforeEach( function () {
			parser = (new ParserFactory).createParser();
		});

		it('should have a function to parse HTML to markdown', function () {
			expect(typeof parser.fromHTML).toEqual( 'function' );
		});


		// Parse HTML to Markdown
		// -------------------------
		describe('Parse HTML to Markdown', function () {
			// Text Nodes
			it('should be able to parse a textNode', function () {
				expect(parser.fromHTML( 'This is a paragraph!' )).toEqual('This is a paragraph!');
				expect(parser.fromHTML( 'This is another text!' )).toEqual('This is another text!');
			});

			it('should throw an error when textNode doesn\'t match the spec.', function () {
				expect(function () { parser.fromHTML('You should escape angle brackets like <'); }).toThrow();
				expect(function () { parser.fromHTML('< that is a bad start'); }).toThrow();
			});

			// Elements
			it('should parse simple <div> tags to a paragraph', function () {
				expect(parser.fromHTML('<div>This text is wrapped inside a div.</div>')).toEqual('This text is wrapped inside a div.');
				expect(parser.fromHTML('<div>Another random text to test the parser!</div>')).toEqual('Another random text to test the parser!');
			});

			it('should parse simple <p> tags to a paragraph', function () {
				expect(parser.fromHTML('<p>This text is wrapped inside a p.</p>')).toEqual('This text is wrapped inside a p.');
				expect(parser.fromHTML('<p>Using the same text because I am lazy...</p>')).toEqual('Using the same text because I am lazy...');
			});

			it('should parse simple <strong> tags to **', function () {
				expect(parser.fromHTML('<strong>Bold statement</strong>')).toEqual('**Bold statement**');
				expect(parser.fromHTML('<strong>Important</strong>')).toEqual('**Important**');
			});

			it('should parse simple <b> tags to **', function () {
				expect(parser.fromHTML('<em>I think we all have emphasis. We may not have enough courage to display it.</em>')).toEqual('*I think we all have emphasis. We may not have enough courage to display it.*');
				expect(parser.fromHTML('<em>You mean emphaty?</em>')).toEqual('*You mean emphaty?*');
			});

			// Complex Elements
			it('should parse complex HTML to Markdown', function () {
				expect(parser.fromHTML('<div>line 1</div><div>line 2</div>')).toEqual('line 1\nline 2');
				expect(parser.fromHTML('<div>line 1</div><div>line 2</div><div>line 3</div>')).toEqual('line 1\nline 2\nline 3');

				expect(parser.fromHTML('<div>count <strong>1</strong> count <em>2</em></div>')).toEqual('count **1** count *2*');
				expect(parser.fromHTML('<div>This is the <em>first</em> paragraph.</div><div>followd by a second one.</div>'))
					.toEqual('This is the *first* paragraph.\nfollowd by a second one.');
			});

			// General Parsing Errors
			it('should throw an error when the startTag doesn\'t match the element specification', function () {
				expect(function () { parser.fromHTML('< div>Meh, typo</div>'); }).toThrow();
				expect(function () { parser.fromHTML('< strong>Meh, typo</strong>'); }).toThrow();
			});

			it('should throw an error when the startTag doesn\'t match the closing tag', function () {
				expect(function () { parser.fromHTML('<div>foobar</p>'); }).toThrow();
				expect(function () { parser.fromHTML('<b>foobar</strong>'); }).toThrow();
			});

			it('should throw an error when no mutation matches the tag to transform', function () {
				expect(function () { parser.fromHTML('<foo>This won\'t work</foo>'); }).toThrow();
			});

			it('should provide helpful error messages.', function () {
				expect(function () { parser.fromHTML('< woops'); }).toThrow('PARSING ERROR: Expected /[a-z]/ but found " " @ 1.');
				expect(function () { parser.fromHTML('<b>foobar</strong>'); }).toThrow('PARSING ERROR: Expected startTag to match closingTag but found "<b>...</strong>" @ 18.');
				expect(function () { parser.fromHTML('<foo>This won\'t work</foo>'); }).toThrow('PARSING ERROR: Expected a known expression to mutate but found "foo" @ 26.');
			});
		});
	});

});
