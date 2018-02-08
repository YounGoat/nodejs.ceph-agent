'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) { 
	let options = {};
	let posOfSecondSlash = req.url.indexOf('/', 1);
		
	// 容器参数。
	if (!agent.conn.get('container')) {
		options.container = req.url.substring(1, posOfSecondSlash);
	}

	// 对象名称参数。
	if (req.query.name) {
		options.name = req.query.name;
	}
	else if (agent.conn.get('container')) {
        options.name = decodeURIComponent(req.pathname.substr(1));
    }
    else {
        options.name = decodeURIComponent(req.url.substr(posOfSecondSlash + 1));
    }

	agent.conn.pullObject(options)
		.on('meta', meta => {
			res.setHeader('content-type', meta.contentType);
		})
		.on('error', err => {
			callback(err, 404);
		})
		.pipe(res).on('finish', callback)
		;	
};