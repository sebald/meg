var MutationFactory = (function () {

	// Mutation Constructor
	// -------------------------
	function Mutation ( options ) {
		if ( !options.exp || !(options.exp instanceof RegExp) ) {
			throw new Error ('MUTATION: "exp" has to be a RegExp.');
		}
		if ( !/string|undefined/.test(typeof options.start) ) {
			throw new Error ('MUTATION: "start" has to be a String.');
		}
		this.exp = options.exp;
		this.start = options.start;
		this.close = options.close || options.start;
	}

	Mutation.prototype.mutate = function ( tagName, content ) {
		return this.exp.test(tagName) ? this.start + content + this.close : null;
	};

	// Factory
	// -------------------------
	function MutationFactory () {}

	MutationFactory.prototype.createMutation = function ( options ) {
		return new Mutation( options || {} );
	};

	return MutationFactory;

})();
