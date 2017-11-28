#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , fs = require('fs')
    , http = require('http')
    , path = require('path')
    
    /* NPM */
    , swift = require('ceph/swift')
    
    /* in-package */
    , goaty = require('../lib/goaty')
    , Sandy = require('../lib/sandy')
    ;

if (process.argv[2] && ['-h', '--help', '/?', 'help'].includes(process.argv[2].toLowerCase())) {
    console.log();
    console.log('NAME');
    console.log('    ceph-agent - Simple HTTP proxy for Ceph storage.');
    console.log();
    console.log('SYNOPSIS');
    console.log('    ceph-agent [connection-config.json]');
    console.log('    Start an HTTP server proxying to the ceph storage described in the config file.')
    console.log('    If argument absent, "ceph.json" in current working directory will be used.');
    console.log();
    process.exit();
}

let configPath = process.argv[2];
if (!configPath) {
    configPath = 'ceph.json';
}

if (!fs.existsSync(configPath)) {
    console.error(`config file not found: ${configPath}`);
    process.exit(1);
}

let config = null;
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error(`failed to load config in ${configPath}`);
    process.exit(1);
}

let conn;
try {
    conn = new swift.Connection(config);
} catch (error) {
    console.error(error);
    process.exit(1);
}

let tempalte = fs.readFileSync(path.resolve(__dirname, '..', 'template', 'swift.html'), 'utf8');
let parser = goaty(tempalte);

let meta = {
    endPoint   : conn.get('endPoint'),
    container  : conn.get('container'),
    username   : conn.get('username')
};

let port = 7000;
let sandy = new Sandy();
http.createServer((req, res) => {
    if (req.url == '/favicon.ico') {
        res.statusCode = 404;
        res.end();
        sandy.log(req, res);
    }

    else if (req.url.endsWith('/')) {
        conn.findObjects({
            path: req.url.substr(1)
        }, (err, metas) => {
            let items = [];
            metas.forEach(meta => {
                if (meta.subdir) {
                    items.push({
                        href: '/' + meta.subdir,
                        text: meta.subdir
                    });
                }
                else {
                    items.push({
                        href: '/' + meta.name,
                        text: meta.name
                    })
                }
            });
            let data = { meta, item: items };
            res.write(parser(data));
            res.end();
            sandy.log(req, res);
        });
    }

    else {
        let name = req.url.substr(1);
        conn.pullObject(name)
            .on('meta', (meta) => {
                res.setHeader('content-type', meta.contentType);
            })
            .on('error', (err) => {
                res.statusCode = 404;
                res.end();
            })
            .pipe(res);
    }

}).listen(port);

console.log(`Ceph Agent started at port ${port}`);

