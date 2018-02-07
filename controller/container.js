'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) {
	res.statusCode = 302;
	res.setHeader('Location', req.url + '/');
	callback();
};