/*global Parser:true */
/* exported meg */

var meg = (function () {

	// MEG Instance
	// -------------------------
	function MEG ( options ) {
		this.mutations = options.mutations;
	}

	MEG.prototype = new Parser();


	// Parsing Functions
	// -------------------------
	MEG.prototype.fromHTML = function ( html ) {
		var result;

		this.reporter.reset();

		this.curPos = 0;
		this.input = html;
		this.curChar = this.input.charAt(this.curPos);

		result = this.parseContent();

		if( result !== this.failed && this.curPos === html.length ) {
			return result.replace(/\s+$/, '');
		} else {
			throw this.reporter.getMessage();
		}
	};


	// Factory
	// -------------------------
	function megFactory ( mutationsHTML ) {
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
		}

		return new MEG( options );
	};

	return megFactory;
})();
