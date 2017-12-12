#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , fs = require('fs')
    , http = require('http')
    , path = require('path')
    
    /* NPM */
    , minimist = require('minimist')
    , noda = require('noda')
    , ceph = require('ceph')
    , portman = require('portman')
    
    /* in-package */
    , goaty = noda.inRequire('lib/goaty')
    , Sandy = noda.inRequire('lib/sandy')
    ;

if (process.argv[2] && ['-h', '--help', '/?', 'help'].includes(process.argv[2].toLowerCase())) {
    console.log(noda.inRead('help.txt', 'utf8'));
    process.exit();
}

const cmdopts = minimist(process.argv.slice(2));

let connConfigPath = cmdopts.C || cmdopts.connection || cmdopts._[0];
if (!connConfigPath && fs.existsSync('ceph.json')) {
    connConfigPath = 'ceph.json';
}
if (!connConfigPath && fs.existsSync('swift.json')) {
    connConfigPath = 'swift.json';
}

if (!fs.existsSync(connConfigPath)) {
    console.error(`config file not found: ${connConfigPath}`);
    process.exit(1);
}

let config = null;
try {
    config = JSON.parse(fs.readFileSync(connConfigPath, 'utf8'));
} catch (error) {
    console.error(`failed to load config in ${connConfigPath}`);
    process.exit(1);
}

let conn;
try {
    conn = new ceph.createConnection(config);
} catch (error) {
    console.error(error);
    process.exit(1);
}

let ERROR_PAGES = {};
if (1) {
    let dirname = noda.inResolve('template/error_pages');
    fs.readdirSync(dirname).forEach((name) => {
        let errorCode = name.replace(/\.html$/i, '');
        ERROR_PAGES[ errorCode ] = fs.readFileSync(path.join(dirname, name), 'utf8');
    });
}

let tempalte = fs.readFileSync(noda.inResolve(`template/home/${conn.get('style')}.html`), 'utf8');
let parser = goaty(tempalte);

let meta;
if (conn.get('style') == 'swift') {
    meta = {
        version    : noda.currentPackage().version,
        endPoint   : conn.get('endPoint'),
        container  : conn.get('container'),
        username   : conn.get('username'),
    };
}
else {
    meta = {
        version    : noda.currentPackage().version,
        endPoint   : conn.get('endPoint'),
        bucket     : conn.get('bucket'),
    };
}

function main(port) {
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
                if (err) {
                    res.statusCode = 500;
                    res.end();
                    return;
                }
                
                let items = [];
                metas.forEach(meta => {

                    // This is a directory item.
                    if (meta.subdir) {
                        items.push({
                            href: '/' + meta.subdir,
                            text: meta.subdir
                        });
                    }

                    // This is a object(file) item.
                    else {
                        items.push({
                            href: '/' + meta.name,
                            text: meta.name
                        })
                    }
                });

                let dirs = [];
                if (1) {
                    let dirnames = req.url.split('/').slice(1, -1);
                    let href = '/';
                    dirs.push({ text: 'ROOT', href });
                    dirnames.forEach((text, index) => {
                        href += text + '/',
                        dirs.push({ text, href });
                    });
                }

                let data = { meta, item: items, dirs };
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
                    res.write(ERROR_PAGES['404']);
                    res.end();
                })
                .pipe(res);
        }

    })
    .on('error', (err) => console.error(`Server error: ${err.message}`))
    .on('listening', () => console.log(`Ceph Agent started at port ${port}`))
    .listen(port)
    ;
    
}

let port = cmdopts.port || cmdopts.p;
if (port) {
    main(port);
}
else {
    portman.seekUsable('>=7000', (err, port) => main(port));
}

