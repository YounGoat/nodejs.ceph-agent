'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	, Sandy = noda.inRequire('class/Sandy')
	;

// 日志实例。
const sandy = new Sandy();

const run = (name, req, res, agent) => {
	let controller = require('./' + name);
	let callback = (err, data) => {
		if (err) {
			// 此句无实际意义，只是为了便于理解。
			let statusCode = data;

			res.statusCode = statusCode;
			res.write(agent.render('error', {
				code: statusCode,
			}));
		}
		if (!res.finished) res.end();
		sandy.log(req, res);
	};
	controller(req, res, agent, callback);
};

module.exports = { run };