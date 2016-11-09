'use strict';

const Logger = require('./Logger');
const Handler = require('./Handler');
const PKG = require('../package.json');

const logger = new Logger();

/**
 * Creates a Handler instance.
 * @param  {JsSIP.UA} ua               The JsSIP.UA instance.
 * @param  {object} [callstatsModule]  The callstats main module (if missing,
 *                                     window.callstats is used).
 * @return {Handler}
 */
function factory(ua, callstatsModule)
{
	logger.debug(`factory() | ${PKG.name} v${PKG.version}`);

	if (typeof ua !== 'object')
		throw new TypeError('ua argument must be a JsSIP.UA instance');

	callstatsModule = callstatsModule || window.callstats;

	if (typeof callstatsModule !== 'function')
		throw new TypeError('callstatsModule argument must be a function (the callstats main module)');

	let handler = new Handler(ua, callstatsModule);

	return handler;
}

module.exports = factory;
