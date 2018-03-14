'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	, kmg = noda.inRequire('lib/kmg')
	;

module.exports = function(req, res, agent, callback) {
	agent.conn.findContainers((err, metas) => {
		if (err) {
			callback(err, 500);
			return;
        }

        let items = metas.map(meta => {
            return {
				metaHref: `/${meta.name}?meta`,
                href: `/${meta.name}/`,
				text: meta.name,
				count: meta.count,
				size: kmg(meta.bytes, 'mega') + 'MB',
            };
        })

		let meta, conn = agent.conn;
		if (conn.get('style') == 'swift') {
			meta = {
				endPoint   : conn.get('endPoint'),
				username   : conn.get('username'),
			};
		}
		else {
			meta = {
				endPoint   : conn.get('endPoint'),
			};
		}

		let data = { meta, item: items };
		let html = agent.render(`containers/${agent.conn.get('style')}`, data);
        res.write(html);
        callback();
    });
};