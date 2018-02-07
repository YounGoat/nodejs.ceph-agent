'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')

	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	;

// location /ceph-agent-public-resources-2018/...
module.exports = function(req, res, agent, callback) {
	let pathname = 'public' + req.pathname.substr(req.pathname.indexOf('/', 1));
	res.write(noda.inRead(pathname));
	callback();
};