/**
 * SEE
 *   Metric Prefixes and SI Units
 *   https://learn.sparkfun.com/tutorials/metric-prefixes-and-si-units
 */
'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	
	/* in-package */
	;

const POWERS = {
	y : 24,
	z : 21,
	e : 18,
	p : 15,
	t : 12,
	g :  9,
	m :  6,
	k :  3,

	yotta : 24,
	zetta : 21,
	exa   : 18,
	peta  : 15,
	tera  : 12,
	giga  :  9,
	mega  :  6,
	kilo  :  3,
};

function kmg(n, prefix) {
	let p = POWERS[ prefix.toLowerCase() ];
	if (!p) {
		throw new Error(`unsupported unit prefix: ${prefix}`);
	}

	let N = Math.pow(1024, p / 3);
	return Math.round(n / N);
}

module.exports = kmg;