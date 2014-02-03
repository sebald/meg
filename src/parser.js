var ParserFactory = (function () {

	// Parser Constructor
	// -------------------------
	function Parser ( options ) {
		var self = this;

		this.failed = null;
		this.mutations = options.mutations;
		this.reporter = new Reporter( 'PARSING ERROR' );


		// Helpers
		// -------------------------
		function writeToResult () {
			var c = self.curChar;
			self.curPos++;
			self.curChar = self.input.charAt( self.curPos );
			return c;
		}

		function resetPosTo ( pos ) {
			self.curPos = pos;
			self.curChar = self.input.charAt( pos );
		}


		// Mutate HTML <> Markdown
		// -------------------------
		function applyMutation ( startTag, content, closingTag ) {
			if ( startTag !== closingTag ) {
				self.reporter.snitch( 'startTag to match closingTag', '<' + startTag + '>...</' + closingTag + '>', self.curPos );
				return self.failed;
			}

			var mutations = self.mutations.html;
			for ( var i = 0, size = mutations.length; i < size; i++ ) {
				var mutant = mutations[i].mutate( startTag, content );
				if ( mutant !== null ) {
					return mutant;
				}
			}

			self.reporter.snitch( 'a known expression to mutate', startTag, self.curPos );
			return self.failed;
		}


		// Grammar
		// -------------------------
		/**
		 *	RULE: Char <- /[^<]/
		 */
		this.parseChar = /[^<]/;

		/**
		 *	RULE: LowerCase <- /[a-z]/
		 */
		this.parseLowerCase = /[a-z]/;

		/**
		 *	RULE: TagName <- /[a-z]+/
		 */
		this.parseTagName = function () {
			var result = '',
				current;

			if ( self.parseLowerCase.test(self.curChar) ) {
				current = writeToResult();
			} else {
				this.reporter.snitch( self.parseLowerCase, self.curChar, this.curPos );
				return self.failed;
			}
			if ( current !== self.failed ) {
				while ( current !== self.failed ) {
					result += current;
					if( self.parseLowerCase.test(self.curChar) ) {
						current = writeToResult();
					} else {
						this.reporter.snitch( self.parseLowerCase, current, this.curPos );
						current = self.failed;
					}
				}
			} else {
				this.reporter.snitch( self.parseLowerCase, curren, this.curPost);
				current = self.failed;
			}
			return result;
		};

		/**
		 *	RULE: TextNode <- Char*
		 */
		this.parseTextNode = function () {
			var result = '',
				current;

			if ( self.parseChar.test(self.curChar) ) {
				current = writeToResult();
			} else {
				this.reporter.snitch( self.parseChar, self.curChar, this.curPos );
				return self.failed;
			}
			if ( current !== self.failed ) {
				while ( current !== self.failed ) {
					result += current;
					if ( self.parseChar.test(self.curChar) ) {
						current = writeToResult();
					} else {
						this.reporter.snitch( self.parseChar, current, this.curPos );
						current = self.failed;
					}
				}
			} else {
				this.reporter.snitch( self.parseChar, current, this.curPos );
				current = self.failed;
			}
			return result;
		};

		/**
		 *	RULE: StartTag <- '<' TagName '>'
		 */
		this.parseStartTag = function () {
			var startPos = self.curPos,
				current,
				tagName;

			if ( self.curChar.charCodeAt(0) === 60 ) {
				current = writeToResult();
			} else {
				this.reporter.snitch( 'StartTag', current, this.curPos );
				return self.failed;
			}
			tagName = self.parseTagName();
			if ( tagName !== self.failed ) {
				if( self.curChar.charCodeAt(0) === 62 ) {
					current = writeToResult();
				} else {
					this.reporter.snitch( 'StartTag', current, this.curPos );
					current = self.failed;
				}
			} else {
				this.reporter.snitch( 'StartTag', current, this.curPos );
				current = self.failed;
			}

			// Reset position.
			if( current === self.failed ) {
				resetPosTo( startPos );
				return self.failed;
			}

			return tagName;
		};

		/**
		 *	RULE: ClosingTag <- '</' TagName '>'
		 */
		this.parseClosingTag = function () {
			var current,
				tagName;

			if ( self.curChar.charCodeAt(0) === 60 ) {
				current = writeToResult();
			} else {
				return self.failed;
			}
			if( self.curChar.charCodeAt(0) === 47 ) {
				current = writeToResult();
			} else {
				return self.failed;
			}
			tagName = self.parseTagName();
			if ( tagName !== self.failed ) {
				if( self.curChar.charCodeAt(0) === 62 ) {
					current = writeToResult();
				} else {
					this.reporter.snitch( 'ClosingTag', current, this.curPos );
					return self.failed;
				}
			} else {
				this.reporter.snitch( 'ClosingTag', current, this.curPos );
				return self.failed;
			}

			return tagName;
		};

		/**
		 *	RULE: Element <- StartTag Content ClosingTag
		 */
		this.parseElement = function () {
			var startPos = self.curPos,
				startTag = self.parseStartTag(),
				content,
				closingTag,
				mutant;
			if ( startTag !== self.failed ) {
				content = self.parseContent();
				if ( content !== self.failed ) {
					closingTag = self.parseClosingTag();
					if ( closingTag !== self.failed ) {
						mutant = applyMutation( startTag, content, closingTag );
						if( mutant === self.failed ) {
							resetPosTo( startPos );
							return self.failed;
						}
						return mutant;
					} else {
						this.reporter.snitch( 'Element', closingTag, this.curPos );
						return self.failed;
					}
				} else {
					this.reporter.snitch( 'Element', content, this.curPos );
					return self.failed;
				}
			}
			this.reporter.snitch( 'Element', startTag, this.curPos );
			return self.failed;
		};

		/**
		 *	RULE: Content <- Element / TextNode
		 */
		this.parseContent = function () {
			var result = '',
				current = self.parseElement();


			if ( current === self.failed ) {
				current = self.parseTextNode();
			}
			while( current !== self.failed ) {
				result += current;
				current = self.parseElement();
				if( current === self.failed ) {
					current = self.parseTextNode();
				}
			}

			return result;
		};
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
