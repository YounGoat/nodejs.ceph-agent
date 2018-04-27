'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, http = require('http')
	, querystring = require('querystring')
	, url = require('url')
	
	/* NPM */
	, noda = require('noda')
	, ceph = require('ceph')
	, cloneObject = require('jinang/cloneObject')
	, if2 = require('if2')
	
	/* in-package */
	, goaty = noda.inRequire('lib/goaty')
	, controller = noda.inRequire('controller')
	;

const PUBLIC_VDIR_NAME = '/ceph-agent-public-resources-2018/';

class Agent {
	constructor(connConfig, config) {
		let conn = new ceph.createConnection(connConfig);
		this.conn = conn;

		config = Object.assign({
			basepath: '',
			title: 'Ceph Object Storage Explorer',
		}, config);
		
		this.basepath = config.basepath;
		this.title    = config.title;
		this.version  = noda.currentPackage().version;
		
		// Remove the failing slash.
		this.basepath = config.basepath.replace(/\/$/, '');

		// Used on rendering.
		this.renderConfig = cloneObject(this, [ 'basepath', 'title', 'version' ]);
		this.renderConfig.public = this.basepath + PUBLIC_VDIR_NAME;

		this.parser = {};

		this.handler = (req, res, next) => {
			let run = name => controller.run(name, req, res, this);
			
			let parsedUrl = url.parse(if2.defined(req.originalUrl, req.url));
			let l = this.basepath.length;
			let basepath = parsedUrl.pathname.slice(0, l);
			let pathname = parsedUrl.pathname.slice(l);

			if (basepath != this.basepath && next) {
				return next();
			}
			
			if (basepath != this.basepath || pathname == '') {
				res.statusCode = 302;
				res.setHeader('Location', this.basepath + '/');
				res.end();
				return;
			}

			req.parsedUrl = parsedUrl;
			req.pathname = pathname;
			req.query = querystring.parse(parsedUrl.query);

			// 图标。
			if (req.pathname == '/favicon.ico') {
				run('favicon');
			}

			else if (req.pathname.startsWith(PUBLIC_VDIR_NAME)) {
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
	}

	breadcrumbs(pathname, isDirectory = false) {
		let locations = [];
		
		let dirnames = pathname.split('/').slice(1);
		if (pathname.endsWith('/')) {
			// 抛弃最后一个空白项。
			dirnames.pop()
			
			// 不是目录，即为对象。slash 应为对象名的末尾部分。
			if (!isDirectory) dirnames.push('/');
		}
		
		let href = this.basepath + '/';
		locations.push({ text: 'ROOT', href });
	
		dirnames.forEach((text, index) => {
			href = (index == dirnames.length -1) ? '' : `${href}${text}/`;
			if (text === '') text = '(null)';
			locations.push({ text, href });
		});
		return locations;
	}

	// This method may be invoked in controller/*.js .
	render(name, data) {
		if (!this.parser[name]) {
			let template = noda.inRead(`template/${name}.html`, 'utf8');
			this.parser[name] = goaty(template);
		}

		if (!data) data = {};
		data.agent = this.renderConfig;

		return this.parser[name](data);
	}

	start(port, callback) {
		let done = function(err, data) {
			callback && callback.apply(null, arguments);
		};	

		http.createServer(this.getHandler())
			.on('error', done)
			.on('listening', () => {
				this.port = port;
				done();
			})
			.listen(port)
			;
	}

	getHandler() {
		return this.handler;
	}
}

module.exports = Agent;