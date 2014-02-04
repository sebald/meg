var ParserFactory = (function () {

	// Parser Constructor
	// -------------------------
	function Parser ( options ) {
		this.mutations = options.mutations;
		this.reporter = new Reporter( 'PARSING ERROR' );
	}


	// Helpers
	// -------------------------
	Parser.prototype.failed = null;

	Parser.prototype.writeToResult = function () {
		var c = this.curChar;
		this.curPos++;
		this.curChar = this.input.charAt( this.curPos );
		return c;
	}

	Parser.prototype.resetPosTo = function ( pos ) {
		this.curPos = pos;
		this.curChar = this.input.charAt( pos );
	}


	// Mutate HTML <> Markdown
	// -------------------------
	Parser.prototype.applyMutation = function ( startTag, content, closingTag ) {
		if ( startTag !== closingTag ) {
			this.reporter.snitch( 'startTag to match closingTag', '<' + startTag + '>...</' + closingTag + '>', this.curPos );
			return this.failed;
		}

		var mutations = this.mutations.html;
		for ( var i = 0, size = mutations.length; i < size; i++ ) {
			var mutant = mutations[i].mutate( startTag, content );
			if ( mutant !== null ) {
				return mutant;
			}
		}

		this.reporter.snitch( 'a known expression to mutate', startTag, this.curPos );
		return this.failed;
	}

	// Grammar
	// -------------------------
	/**
	 *	RULE: Char <- /[^<]/
	 */
	Parser.prototype.parseChar = /[^<]/;

	/**
	 *	RULE: LowerCase <- /[a-z]/
	 */
	Parser.prototype.parseLowerCase = /[a-z]/;

	/**
	 *	RULE: TagName <- /[a-z]+/
	 */
	Parser.prototype.parseTagName = function () {
		var result = '',
			current;

		if ( this.parseLowerCase.test(this.curChar) ) {
			current = this.writeToResult();
		} else {
			this.reporter.snitch( this.parseLowerCase, this.curChar, this.curPos );
			return this.failed;
		}
		if ( current !== this.failed ) {
			while ( current !== this.failed ) {
				result += current;
				if( this.parseLowerCase.test(this.curChar) ) {
					current = this.writeToResult();
				} else {
					this.reporter.snitch( this.parseLowerCase, current, this.curPos );
					current = this.failed;
				}
			}
		} else {
			this.reporter.snitch( this.parseLowerCase, curren, this.curPost);
			current = this.failed;
		}
		return result;
	};

	/**
	 *	RULE: TextNode <- Char*
	 */
	Parser.prototype.parseTextNode = function () {
		var result = '',
			current;

		if ( this.parseChar.test(this.curChar) ) {
			current = this.writeToResult();
		} else {
			this.reporter.snitch( this.parseChar, this.curChar, this.curPos );
			return this.failed;
		}
		if ( current !== this.failed ) {
			while ( current !== this.failed ) {
				result += current;
				if ( this.parseChar.test(this.curChar) ) {
					current = this.writeToResult();
				} else {
					this.reporter.snitch( this.parseChar, current, this.curPos );
					current = this.failed;
				}
			}
		} else {
			this.reporter.snitch( this.parseChar, current, this.curPos );
			current = this.failed;
		}
		return result;
	};

	/**
	 *	RULE: StartTag <- '<' TagName '>'
	 */
	Parser.prototype.parseStartTag = function () {
		var startPos = this.curPos,
			current,
			tagName;

		if ( this.curChar.charCodeAt(0) === 60 ) {
			current = this.writeToResult();
		} else {
			this.reporter.snitch( 'StartTag', current, this.curPos );
			return this.failed;
		}
		tagName = this.parseTagName();
		if ( tagName !== this.failed ) {
			if( this.curChar.charCodeAt(0) === 62 ) {
				current = this.writeToResult();
			} else {
				this.reporter.snitch( 'StartTag', current, this.curPos );
				current = this.failed;
			}
		} else {
			this.reporter.snitch( 'StartTag', current, this.curPos );
			current = this.failed;
		}

		// Reset position.
		if( current === this.failed ) {
			this.resetPosTo( startPos );
			return this.failed;
		}

		return tagName;
	};

	/**
	 *	RULE: ClosingTag <- '</' TagName '>'
	 */
	Parser.prototype.parseClosingTag = function () {
		var current,
			tagName;

		if ( this.curChar.charCodeAt(0) === 60 ) {
			current = this.writeToResult();
		} else {
			return this.failed;
		}
		if( this.curChar.charCodeAt(0) === 47 ) {
			current = this.writeToResult();
		} else {
			return this.failed;
		}
		tagName = this.parseTagName();
		if ( tagName !== this.failed ) {
			if( this.curChar.charCodeAt(0) === 62 ) {
				current = this.writeToResult();
			} else {
				this.reporter.snitch( 'ClosingTag', current, this.curPos );
				return this.failed;
			}
		} else {
			this.reporter.snitch( 'ClosingTag', current, this.curPos );
			return this.failed;
		}

		return tagName;
	};

	/**
	 *	RULE: Element <- StartTag Content ClosingTag
	 */
	Parser.prototype.parseElement = function () {
		var startPos = this.curPos,
			startTag = this.parseStartTag(),
			content,
			closingTag,
			mutant;
		if ( startTag !== this.failed ) {
			content = this.parseContent();
			if ( content !== this.failed ) {
				closingTag = this.parseClosingTag();
				if ( closingTag !== this.failed ) {
					mutant = this.applyMutation( startTag, content, closingTag );
					if( mutant === this.failed ) {
						this.resetPosTo( startPos );
						return this.failed;
					}
					return mutant;
				} else {
					this.reporter.snitch( 'Element', closingTag, this.curPos );
					return this.failed;
				}
			} else {
				this.reporter.snitch( 'Element', content, this.curPos );
				return this.failed;
			}
		}
		this.reporter.snitch( 'Element', startTag, this.curPos );
		return this.failed;
	};

	/**
	 *	RULE: Content <- Element / TextNode
	 */
	Parser.prototype.parseContent = function () {
		var result = '',
			current = this.parseElement();


		if ( current === this.failed ) {
			current = this.parseTextNode();
		}
		while( current !== this.failed ) {
			result += current;
			current = this.parseElement();
			if( current === this.failed ) {
				current = this.parseTextNode();
			}
		}

		return result;
	}


	Parser.prototype.fromHTML = function ( html ) {
		var result;

		this.maxFailPos = 0;
		this.maxFailExpected = {};

		this.curPos = 0;
		this.input = html;
		this.curChar = this.input.charAt(this.curPos);

		result = this.parseContent();

		if( result !== this.failed && this.curPos === html.length ) {
			return result.replace(/\s+$/, '');
		} else {
			throw this.reporter.getMessage();
		}
	}


	// Factory
	// -------------------------
	function ParserFactory () {}

	ParserFactory.prototype.createParser = function ( mutationsHTML ) {
		var DEFAULT_MUTATIONS_HTML = [
				{ exp: /^em$|^i$/, start: '*' },
				{ exp: /^strong$|^b$/, start: '**' },
				{ exp: /^div$|^p$/, start: '', close: '\n' }
			],
			mutationFactory = new MutationFactory(),
			options = {mutations: {html: [] } },
			tmp;

		tmp = DEFAULT_MUTATIONS_HTML.concat( mutationsHTML || [] );
		for ( var i = 0, size = tmp.length; i < size; i++ ) {
			options.mutations.html.push( mutationFactory.createMutation(tmp[i]) );
		};

		return new Parser( options );
	};

	return ParserFactory;
})();
