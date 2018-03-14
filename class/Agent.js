'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, http = require('http')
	, querystring = require('querystring')
	, url = require('url')
	
	/* NPM */
	, noda = require('noda')
	, ceph = require('ceph')
	
	/* in-package */
	, goaty = noda.inRequire('lib/goaty')
	, controller = noda.inRequire('controller')
	;

class Agent {
	constructor(connConfig) {
		let conn = new ceph.createConnection(connConfig); 
		
		let pkg = noda.currentPackage();
		this.config = pkg.config;
		this.config.version = pkg.version;

		this.conn = conn;
		this.parser = {};
	}

	// This method may be invoked in controller/*.js .
	render(name, data) {
		if (!this.parser[name]) {
			let template = noda.inRead(`template/${name}.html`, 'utf8');
			this.parser[name] = goaty(template);
		}

		if (!data) data = {};
		data.config = this.config;
		return this.parser[name](data);
	}

	start(port, callback) {
		let done = function(err, data) {
			callback && callback.apply(null, arguments);
		};

		let listener = (req, res) => {
			let run = name => controller.run(name, req, res, this);
			req.parsedUrl = url.parse(req.url);
			req.pathname = req.parsedUrl.pathname;
			req.query = querystring.parse(req.parsedUrl.query);

			// 图标。
			if (req.pathname == '/favicon.ico') {
				run('favicon');
			}

			else if (req.pathname.startsWith(noda.currentPackage().config['public-location'])) {
				run('public');
			}

			// 容器列表。
			else if (!this.conn.get('container') && req.pathname == '/') {
				run('containers');
			}

			// 容器。
			else if (!this.conn.get('container') && req.pathname.substr(1).indexOf('/') == -1) {
				run('container');
			}

			// 目录。
			else if ((req.pathname.endsWith('/') || req.pathname.endsWith('*')) && !req.query.name) {
				run('directory');
			}

			// 文件（对象）。
			else {
				run('object');
			}
		};

		http.createServer(listener)
			.on('error', done)
			.on('listening', () => {
				this.port = port;
				done();
			})
			.listen(port)
			;
	}

}

module.exports = Agent;