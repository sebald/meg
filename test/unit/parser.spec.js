describe('[parser.js]', function () {
	var parser, mutationFactory;

	beforeEach( function () {
		parser = new Parser();
		mutationFactory = new MutationFactory();

		spyOn(parser.reporter, 'snitch' );
	});

	it('should be defined', function () {
		expect(Parser).toBeDefined();
		expect(typeof Parser).toEqual( 'function' );
	});

	it('should be possible to create a new Praser', function () {
		expect(Parser() instanceof Parser);
	});


	// Helpers
	// -------------------------
	describe('Helpers', function () {
		it('should have a failed "const"', function () {
			expect(parser.failed).toBeDefined();
			expect(parser.failed).toEqual( null );
		});

		it('should have a function to return the current char and iterate', function () {
			parser.input = 'hello';
			parser.curPos = 0;
			parser.curChar = parser.input[parser.curPos];
			var result = parser.writeToResult();

			expect(result).toEqual( 'h' );
			expect(parser.curPos).toEqual( 1 );
			expect(parser.curChar).toEqual( 'e' );
		});

		it('should have a function to reset current state to a position', function () {
			parser.input = 'hello';
			parser.curPos = 3;
			parser.curChar = parser.input[parser.curPos];
			parser.resetPosTo(0);

			expect(parser.curPos).toEqual( 0 );
			expect(parser.curChar).toEqual( 'h' );
		});
	});


	// Mutate
	// -------------------------
	describe('Mutate', function () {
		it('should addd error message to reporter if start and closing tags are not equal', function () {
			expect(parser.applyMutation('a', 'text', 'b')).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});

		it('should return FAILED if no mutation rule matched', function () {
			expect(parser.applyMutation('a', 'text', 'a')).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});

		it('should be able to transform a certain string via mutation rules', function () {
			parser.mutations.html = [
				mutationFactory.createMutation({ exp: /^a$/, start: '!!!' })
			];
			expect(parser.applyMutation('a', 'text', 'a')).toEqual( '!!!text!!!' );
			expect(parser.reporter.snitch).not.toHaveBeenCalled();
		});

		it('should apply the correct transformation', function () {
			parser.mutations.html = [
				mutationFactory.createMutation({ exp: /^a$/, start: '!!!' }),
				mutationFactory.createMutation({ exp: /^b$/, start: '###' })
			];
			expect(parser.applyMutation('a', 'text', 'a')).toEqual( '!!!text!!!' );
			expect(parser.applyMutation('b', 'text', 'b')).toEqual( '###text###' );
			expect(parser.reporter.snitch).not.toHaveBeenCalled();
		});
	});


	// Grammar
	// -------------------------
	describe('Grammar', function () {
		var initParser = function ( input ) {
			parser.input = input;
			parser.resetPosTo(0);
		};

		beforeEach(function () {
			parser.mutations.html = [
				mutationFactory.createMutation({ exp: /^em$/, start: '*' }),
				mutationFactory.createMutation({ exp: /^strong$/, start: '**' })
			];
		});

		it('should have a rule for "Char"', function () {
			expect(parser.parseChar instanceof RegExp).toBeTruthy();
		});

		it('should have a rule for "LowerCase"', function () {
			expect(parser.parseLowerCase instanceof RegExp).toBeTruthy();
		});


		// TagName
		// -------------------------
		it('should be possible to parse a "TagName"', function () {
			initParser('div');
			expect(parser.parseTagName()).toEqual('div');

			initParser('b');
			expect(parser.parseTagName()).toEqual('b');
		});

		it('should return a result until "TagName" doesn\'t match the rule anymore', function () {
			initParser('a#');
			expect(parser.parseTagName()).toEqual('a');
			expect(parser.reporter.snitch).toHaveBeenCalled();
			// Note: We do this to be more robust when reading a TagName.
		});

		it('should return FAILED and snitch if "TagName" parsing fails', function () {
			initParser('#');
			expect(parser.parseTagName()).toEqual(parser.failed);
			expect(parser.reporter.snitch).toHaveBeenCalled();

		});


		// TextNode
		// -------------------------
		it('should be possible to parse a "TextNode"', function () {
			initParser('some Text');
			expect(parser.parseTextNode()).toEqual( 'some Text' );
		});

		it('should read "TextNode" as long as rule matches', function () {
			initParser('another Text<');
			expect(parser.parseTextNode()).toEqual( 'another Text' );
			expect(parser.reporter.snitch).toHaveBeenCalled();
			// Note: It will also snitch because it could be an error. But in most cases
			// this is only the end of the TextNode.
		});

		it('should return FAILED and snitch if "TextNode" parsing fails', function () {
			initParser('<');
			expect(parser.parseTagName()).toEqual(parser.failed);
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});


		// StarTag
		// -------------------------
		it('should be possible to parse a "StartTag"', function () {
			initParser('<div>');
			expect(parser.parseStartTag()).toEqual('div');
		});

		it('should return to the exact state if parsing "StartTag" fails', function () {
			var state;

			initParser('This is not a "StartTag" but a "TextNode"');
			state = { pos: parser.curPos, c: parser.curChar };

			expect(parser.parseStartTag()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			expect(parser.curPos).toEqual( state.pos );
			expect(parser.curChar).toEqual( state.c );

			initParser('<This is not just wrong.');
			state = { pos: parser.curPos, c: parser.curChar };

			expect(parser.parseStartTag()).toEqual( parser.failed );
			expect(parser.curPos).toEqual( state.pos );
			expect(parser.curChar).toEqual( state.c );
		});

		it('should return FAILED anf snitch if "StartTag" fails', function () {
			initParser('noooooo');
			expect(parser.parseStartTag()).toEqual(parser.failed);
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});


		// ClosingTag
		// -------------------------
		it('should be possible to parse a "ClosingTag"', function () {
			initParser('</p>');
			expect(parser.parseClosingTag()).toEqual('p');
		});

		it('should return FAILED and snitch if "ClosingTag" parsing fails', function () {
			initParser('p>');
			expect(parser.parseClosingTag()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('<p>');
			expect(parser.parseClosingTag()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('</p');
			expect(parser.parseClosingTag()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('</#>');
			expect(parser.parseClosingTag()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});


		// Element
		// -------------------------
		it('should be possible to parse an "Element"', function () {
			initParser('<em>This is an element!</em>');
			expect(parser.parseElement()).toEqual('*This is an element!*');
		});

		it('should return FAILED and snitch if "Element" parsing fails', function () {
			initParser('em>This is an element!</em>');
			expect(parser.parseElement()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('<em>Th<is is an element!</em>');
			expect(parser.parseElement()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('<em>This is an element!<em>');
			expect(parser.parseElement()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();

			initParser('<foo>This is an element!</foo>');
			expect(parser.parseElement()).toEqual( parser.failed );
			expect(parser.reporter.snitch).toHaveBeenCalled();
		});


		// Content
		// -------------------------
		it('should be possible to parse a "Content"', function () {
			initParser('<em>This is an element!</em>');
			expect(parser.parseContent()).toEqual('*This is an element!*');

			initParser('This is some text.');
			expect(parser.parseContent()).toEqual('This is some text.');
		});

		it('should fail and snitch if "Content" parsing fails', function () {
			var html = '<em asdsa</sad>',
				result = initParser( html );
			expect(result !== parser.failed && parser.curPos === html.length).toBeFalsy();

			html = '<em>< noes</em>';
			result = initParser( html );
			expect(result !== parser.failed && parser.curPos === html.length).toBeFalsy();
		});
	});
});
