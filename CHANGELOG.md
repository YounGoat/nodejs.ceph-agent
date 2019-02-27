#   ceph-agent Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##  [0.6.0] - Feb 27th, 2019

*   Fixed the bug that the resources files ignored by mistake on publishing.

##  [0.5.3] - July 14th, 2018

*   Fixed the bug on non-ASCII characters being present in object names (directory name).

##  [0.5.2] - June 11th, 2018

*   Upgrade dependency [ceph](https://www.npmjs.com/package/ceph).

##  [0.5.1] - June 5th, 2018

*   Meta value auto-decoded via [mifo](https://www.npmjs.com/package/mifo).

##  [0.4.0] - Apr 23rd, 2018

*   Dependencies upgraded.
*   *Container meta page* completed.

##  [0.3.0] - Mar 14th, 2018, RISKY

*   On exploring directory, tailing asterisk is accepted to filter items with prefixed name. E.g.
    http://localhost:7000/foo/bar/q*  
    And then, when access an object whose name really tailed with asterisk, use query name as replacement:  
    http://localhost:7000/?name=foo/bar/q*

##	[0.2.0] - Feb 23rd, 2018

*	Fixed the bug that option `-C` not recognized.
*	Display total object count for containers and byte size for object (file).

##	[0.1.1] - Feb 8th, 2018

*	Remove debug code wrongly published with version 0.1.0 .

##	[0.1.0] - Feb 8th, 2018

This is a more mature version than ever:
*	UI optimized.
*	Containers / Buckets list available.

##	[0.0.3] - Jan 10, 2018

*	Dependencies upgraded.

##  [0.0.2] - Nov 29, 2017

*   Fixed the bug that command `ceph-agent` doesnot work.

##	[0.0.1] - 2017-11-28

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
