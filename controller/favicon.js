'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')

	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) {
	res.write(noda.inRead('resources/logo.32.png'));
	callback();
};