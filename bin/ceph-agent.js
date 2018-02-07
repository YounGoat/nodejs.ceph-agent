#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , fs = require('fs')
    , path = require('path')
    , url = require('url')
    
    /* NPM */
    , commandos = require('commandos')
    , noda = require('noda')
    , ceph = require('ceph')
    , portman = require('portman')
    
    /* in-package */
    , goaty = noda.inRequire('lib/goaty')
    , Agent = noda.inRequire('class/Agent')

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

let agent = null;
if (1) {
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

    agent = new Agent(connConfig);
}

function main(port) {
    let callback = (err) => {
        if (err) {
            console.error(`Server error: ${err.message}`);
        }
        else {
            console.log(`Ceph Agent started at port ${port}`);
        }
    };

    if (cmd.port) {
        agent.start(cmd.port);
    }
    else {
        portman.seekUsable('>=7000', (err, usablePort) => {
            if (err) {
                callback(err);
            }
            else {
                port = usablePort;
                agent.start(port, callback);
            }
        });
    }
}

main();

