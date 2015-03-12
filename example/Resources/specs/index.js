"use strict";

// create the test suite
describe('mocha', function () {
	it('works', function () {
		var x = 42;
		var f = function(y/*: number*/)/*: string*/ {
			return "hello world";
		};
		f(42);
	});
});

module.exports = {};
