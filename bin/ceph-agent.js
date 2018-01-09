#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , fs = require('fs')
    , http = require('http')
    , path = require('path')
    
    /* NPM */
    , commandos = require('commandos')
    , noda = require('noda')
    , ceph = require('ceph')
    , portman = require('portman')
    
    /* in-package */
    , goaty = noda.inRequire('lib/goaty')
    , Sandy = noda.inRequire('lib/sandy')

    /* in-file */
    , help = () => console.log(noda.inRead('help.txt', 'utf8'))
    ;

const cmd = commandos.parse({
    groups: [[ 
            '--help -h [0:=* help]',
        ], [
            '--port -p [*:~ ^\\d+$]',
            '--connection -C [*]',
            '--container --bucket',
        ], ],    
    catcher: help
});

if (cmd.help) {
    help();
    process.exit();
}

let connConfigPath = cmd.connection;
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

let connConfig = null;
try {
    connConfig = JSON.parse(fs.readFileSync(connConfigPath, 'utf8'));
} catch (error) {
    console.error(`failed to load config in ${connConfigPath}`);
    process.exit(1);
}
if (cmd.container) connConfig.container = cmd.container;

let conn;
try {
    conn = new ceph.createConnection(connConfig);
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

let sandy;
let listener = (req, res) => {
    let endRes = (statusCode) => {
        if (statusCode) {
            res.statusCode = statusCode;
            res.write(ERROR_PAGES[statusCode]);
        }
        res.end();
        sandy.log(req, res);
    };
    
    let onMetas = (err, metas) => {
        if (err) {
            console.log(err.toString());                    
            return endRes(500);
        }

        let items = [];
        metas.forEach(meta => {

            // This is a directory item.
            if (meta.subdir) {
                items.push({
                    href: '/' + meta.subdir,
                    text: meta.subdir,
                    target: '_self',
                });
            }

            // This is a object(file) item.
            else {
                items.push({
                    href: '/' + meta.name,
                    text: meta.name,
                    target: '_blank',
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
        endRes();
    };
    

    if (req.url == '/favicon.ico') {
        endRes(404);
    }
    else if (req.url.endsWith('/')) {
        conn.findObjects({
            path: req.url.substr(1)
        }, onMetas);
    }
    else {
        let name = req.url.substr(1);
        conn.pullObject(name)
            .on('meta', (meta) => {
                res.setHeader('content-type', meta.contentType);
            })
            .on('error', (err) => {
                endRes(404);
            })
            .pipe(res);
    }
};

function main(port) {
    sandy = new Sandy();
    http.createServer(listener)
        .on('error', (err) => console.error(`Server error: ${err.message}`))
        .on('listening', () => console.log(`Ceph Agent started at port ${port}`))
        .listen(port)
        ;
    
}

if (cmd.port) {
    main(cmd.port);
}
else {
    portman.seekUsable('>=7000', (err, port) => main(port));
}

