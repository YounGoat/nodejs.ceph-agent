'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) {
	// 取元数据 OR 取内容。
	if (Object.keys(req.query).includes('meta')) {
		let container = req.pathname;
		let data = {};
		let html = agent.render(`container/${agent.conn.get('style')}`, data);
        res.write(html);
		callback();
	}
	else {
		res.statusCode = 302;
		res.setHeader('Location', req.pathname + '/');
		callback();
	}
};