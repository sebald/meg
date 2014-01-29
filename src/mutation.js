var MutationFactory = (function () {

	// Mutation Constructor
	// -------------------------
	function Mutation ( options ) {
		if ( !options.exp || !(options.exp instanceof RegExp) ) {
			throw new Error ('MUTATION: "exp" has to be a RegExp.');
		}
		if ( !options.action || typeof options.action !== 'function' ) {
			throw new Error ('MUTATION: "action" has to be a Function.');
		}
		this.exp = options.exp;
		this.action = options.action;
	}

	Mutation.prototype.mutate = function ( s ) {
		return this.exp.test(s) ? this.action(s) : null;
	};

	// Factory
	// -------------------------
	function MutationFactory () {}

	MutationFactory.prototype.createMutation = function ( options ) {
		return new Mutation( options || {} );
	};

	return MutationFactory;

})();
