'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, if2 = require('if2')
	, noda = require('noda')
	, forInObject = require('jinang/forInObject')
	
	/* in-package */
	, kmg = noda.inRequire('lib/kmg')
	;

module.exports = function(req, res, agent, callback) {
	// 取元数据 OR 取内容。
	if (Object.keys(req.query).includes('meta')) {
		let container = req.pathname.slice(1);
		let locations = agent.breadcrumbs(req.pathname, false);

		let meta, containerInfo = [], containerMeta = [];
		if (agent.conn.get('style') == 'swift') {
			meta = {
				endPoint   : agent.conn.get('endPoint'),
				username   : agent.conn.get('username'),
			};
		}
		else {
			meta = {
				endPoint   : agent.conn.get('endPoint'),
			};
		}

		agent.conn.readContainer(container, (err, data) => {
			if (err) {
				callback(err, 404);
			}
			else {
				forInObject(data, (name, value) => {
					if (name == 'meta') return;
					if (['bytes-used', 'bytes-used-actual'].includes(name)) {
						value = `${value} ( ${kmg(value)}B )`;
					}
					containerInfo.push({ name, value });
				});
				forInObject(data.meta, (name, value) => {
					containerMeta.push({ name, value });
				});
				let html = agent.render(`container/${agent.conn.get('style')}`, { locations, meta, containerInfo, containerMeta });
				res.write(html);
				callback();				
			}
		});
	}
	else {
		res.statusCode = 302;
		res.setHeader('Location', req.pathname + '/');
		callback();
	}
};