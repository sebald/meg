var Reporter = (function () {

	function Reporter ( prefix ) {
		this.prefix = prefix || 'ERROR';
		this.maxFailPos = 0;
		this.failure = {};
	}

	Reporter.prototype.snitch = function ( expected, found, position ) {
		if ( position < this.maxFailPos ) {
			return;
		}

		if ( position > this.maxFailPos ) {
			this.maxFailPos = position;
			this.failure = { expected: expected, found: found };
		}
	}

	Reporter.prototype.getMessage = function () {
		return this.prefix + ': Expected ' + this.failure.expected + ' but found "' +
				this.failure.found + '" @ ' + this.maxFailPos + '.';
	}

	return Reporter;

})();
