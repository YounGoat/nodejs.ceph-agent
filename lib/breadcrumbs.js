'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	
	/* in-package */
	;

function breadcrumbs(pathname, isDirectory = false) {
	let locations = [];
	
	let dirnames = pathname.split('/').slice(1);
	if (pathname.endsWith('/')) {
		// 抛弃最后一个空白项。
		dirnames.pop()
		
		// 不是目录，即为对象。slash 应为对象名的末尾部分。
		if (!isDirectory) dirnames.push('/');
	}
	
	let href = '/';
	locations.push({ text: 'ROOT', href });

	dirnames.forEach((text, index) => {
		href = (index == dirnames.length -1) ? '' : `${href}${text}/`;
		if (text === '') text = '(null)';
		locations.push({ text, href });
	});
	return locations;
}

module.exports = breadcrumbs;