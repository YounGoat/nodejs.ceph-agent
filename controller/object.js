'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, if2 = require('if2')
	, mifo = require('mifo')
	, noda = require('noda')
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) { 
	let options = {};
	let posOfSecondSlash = req.pathname.indexOf('/', 1);
		
	// 容器参数。
	if (!agent.conn.get('container')) {
		options.container = req.pathname.substring(1, posOfSecondSlash);
	}

	// 对象名称参数。
	if (req.query.name) {
		options.name = req.query.name;
	}
	else if (agent.conn.get('container')) {
        options.name = decodeURIComponent(req.pathname.substr(1));
    }
    else {
        options.name = decodeURIComponent(req.pathname.substr(posOfSecondSlash + 1));
	}

	let pesudoPathname = agent.conn.get('container') ? `/${options.name}` : `/${options.container}/${options.name}`;
	let locations = agent.breadcrumbs(pesudoPathname, false);
	
	// 取元数据 OR 取内容。
	if (Object.keys(req.query).includes('meta')) {
		agent.conn.readObjectMeta(options, (err, data) => {
			if (err) {
				callback(err, 404);
			}
			else {
				let meta, objectInfo = [], objectMeta = [];

				for (let name in data) {
					if (name == 'meta') continue;
					objectInfo.push({ name, value: data[name] });
				}
				if (data.meta) {
					for (let name in data.meta) {
						let value = data.meta[name];
						objectMeta.push({ name, value });
						
						// Since ceph@0.8.4, mifo encode/decode already integrated in creating/reading object.
						// So next code snippet is redundant.
						let decoded = mifo.decode(value);
						if (decoded) {
							objectMeta.push({
								name,
								value: `<span class="decoded"><small>DECODED AS</small>${decoded}</span>`,
							});
						}
					}
				}

				if (agent.conn.get('style') == 'swift') {
					meta = {
						endPoint   : agent.conn.get('endPoint'),
						username   : agent.conn.get('username'),
						container  : if2(options.container, agent.conn.get('container')),
						name       : options.name,
					};
				}
				else {
					meta = {
						endPoint   : agent.conn.get('endPoint'),
						bucket     : if2(options.container, agent.conn.get('container')),
					};
				}

				let html = agent.render(`object/${agent.conn.get('style')}`, { locations, meta, objectInfo, objectMeta } );
				res.write(html);
				callback();
			}
		});
	}
	else {
		agent.conn.pullObject(options)
			.on('meta', meta => {
				res.setHeader('content-type', meta.contentType);
			})
			.on('error', err => {
				callback(err, 404);
			})
			.pipe(res).on('finish', callback)
			;
	}
};