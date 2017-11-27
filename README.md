#	ceph-agent
__Simple UI for CEPH storage__

Languages / [简体中文](./README.zh_CN.md)

##	Table of contents

*	[Get Started](#get-started)
*	[API](#api)
* 	[Examples](#examples)
*	[Why ceph-agent](#why-ceph-agent)
*	[Honorable Dependents](#honorable-dependents)
*	[About](#about)
*	[References](#references)
*   [Recommendations](#recommendations)

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/nodejs.ceph-agent)

##	Get Started

Firstly, create a JSON file and put into your CEPH storage connection configurations.

```javascript
// swift.json
{
    "endPoint"   : "http://storage.example.com/",
    "subuser"    : "userName:subUserName",
    "key"        : "380289ba59473a368c593c1f1de6efb0380289ba5",
    "container"  : "containerName"
}
```

Then, run `ceph-agent` passing path of the JSON file.

```bash
ceph-agent swift.json
```

By default, an HTTP service listening on port 7000 will be started. You may access the CEPH storage via http://localhost:7000/ .

##	API

##  Examples

##  Why *ceph-agent*

##  Honorable Dependents

##  About

##  References

##  Recommendations

*   [ceph](https://www.npmjs.com/package/ceph)
*   [osapi](https://www.npmjs.com/package/osapi)