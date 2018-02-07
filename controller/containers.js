'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	
	/* in-package */
	;

module.exports = function(req, res, agent, callback) {
	agent.conn.findContainers((err, metas) => {
		if (err) {
			callback(err, 500);
			return;
        }

        let items = metas.map(meta => {
            return {
                href: '/' + meta.name + '/',
				text: meta.name,
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