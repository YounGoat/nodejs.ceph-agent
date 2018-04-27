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
	Y : 24,
	Z : 21,
	E : 18,
	P : 15,
	T : 12,
	G :  9,
	M :  6,
	K :  3,
};

const POWERS_LONG = {
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
	let p, unit = null;
	if (arguments.length == 1) {
		let e = Math.ceil(Math.log2(n) / 10) * 3;
		for (let prefix in POWERS) {
			p = POWERS[prefix];
			if (e > p) {
				unit = prefix;
				break;
			}
		}
	}
	else {
		p = POWERS[prefix.toUpperCase()] || POWERS_LONG[prefix.toLowerCase()];
		if (!p) {
			throw new Error(`unsupported unit prefix: ${prefix}`);
		}
	}
	
	let N = Math.pow(1024, p / 3);
	let ret = Math.round(n / N);
	if (unit) ret = `${ret}${unit}`;
	return ret;
}

module.exports = kmg;