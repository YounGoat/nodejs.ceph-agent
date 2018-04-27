'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
    , modifyUrl = require('jinang/modifyUrl')
    , noda = require('noda')
	
    /* in-package */
    
    /* in-file */
    , encodeName = name => name.split('/').map(encodeURIComponent).join('/')

    , formatD = n => n < 10 ? '0' + n : '' + n

    , formatDate = d => {
        if (typeof d == 'string') d = new Date(d);

        let Y = d.getYear() + 1900 + '';

        let M = d.getMonth() + 1;
        M = formatD(M);

        let D = d.getDate();
        D = formatD(D);

        let H = d.getHours();
        H = formatD(H);

        let m = d.getMinutes();
        m = formatD(m);

        return `${Y}/${M}/${D} ${H}:${m}`;
    }
	;

module.exports = function(req, res, agent, callback) {
    let options = {}, base = null, container = null;
    let pathname = req.pathname;
    if (agent.conn.get('container')) {
        container = agent.conn.get('container');
        options.container = container;
        pathname = pathname.substr(1);
        base = `${agent.basepath}/`;
    }
    else {
        let pos = pathname.indexOf('/', 1);
        container = pathname.substring(1, pos);
        options.container = container;
        pathname = pathname.substr(pos + 1);
        base = `${agent.basepath}/${options.container}/`;
    }

    if (pathname.endsWith('*')) {
        options.prefix = pathname.slice(0, -1);
        options.delimiter = '/';
    }
    else {
        options.path = pathname;
        options.delimiter = '';
    }    

    let finders = [];
    
    // 查询指定 path 且 path 为空时，名称以 / 起始的对象会被忽略，而不是作为一个 subdir 返回。
    if (options.path === '') {
        let options2 = {
            container: options.container,
            prefix: '/',
            limit: 1,
        };
        let p = agent.conn.findObjects(options2).then(metas => 
            // 如果有名称前缀 / 的对象，则模拟一个虚拟子目录。
            metas.length ? [ { subdir: '/' } ] : []);  
        finders.push(p);
    }

    // 查询指定 path 时，与该 path 同名的对象会被忽略。
    else {
        let options2 = {
            container: options.container,
            prefix: options.path, 
            limit: 1,
        };
        let p = agent.conn.findObjects(options2).then(metas => 
            metas.length && metas[0].name === options.path ? metas : []);  
        finders.push(p);
    }

    finders.push(agent.conn.findObjects(options));

    Promise.all(finders).then(metaGroups => {
        let dirs = [], files = [];
        let concatHref = pathname => `//${req.headers.host}${base}${pathname}`;
        
        metaGroups.forEach(metas => {
            metas.forEach(meta => {
                // This is a directory item.
                if (meta.subdir) {
                    dirs.push({
                        href: concatHref(meta.subdir),
                        text: meta.subdir,
                    });
                }

                // This is a object(file) item.
                else {
                    let name = encodeName(meta.name);
                    let isSpecialName = name.endsWith('/') || name.endsWith('*');
                    let downloadHref = concatHref(isSpecialName ? `?name=${name}` : name);
                    let metaHref = concatHref(isSpecialName ? `?name=${name}&meta` : `${name}?meta`);
                    let text = /^\s+$/.test(meta.name) ? '[WHITESPACES]' : meta.name;
                    files.push({
                        downloadHref,
                        metaHref,
                        text,
                        lastModified: formatDate(meta.last_modified),
                    })
                }
            });
        });

        if (dirs.length + files.length == 0) {
            callback(new Error('no objects found'), 404);
            return;
        }

        let meta, conn = agent.conn;
        if (conn.get('style') == 'swift') {
            meta = {
                endPoint   : conn.get('endPoint'),
                username   : conn.get('username'),
                container  : container,
            };
        }
        else {
            meta = {
                endPoint   : conn.get('endPoint'),
                bucket     : container,
            };
        }

        let locations = agent.breadcrumbs(req.pathname, true);
        let data = { meta, dirs, files, locations };
        let html = agent.render(`directory/${agent.conn.get('style')}`, data);
        res.write(html);
        callback();

    }).catch(err => {
        console.log(err);
        callback(err, 500)
    });
};