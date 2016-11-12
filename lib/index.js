'use strict';

const Logger = require('./Logger');
const SessionHandler = require('./SessionHandler');

const logger = new Logger();

// By default, take callstats module from window.callstats.
let callstatsModule = window.callstats;

/**
 * Handles a JsSIP.UA instance and initializes a callstats object.
 * @param  {JsSIP.UA} ua - The JsSIP.UA instance.
 * @param  {string} AppID - Same as in callstats.initialize().
 * @param  {string} AppSecretOrTokenGenerator - Same as in callstats.initialize().
 * @param  {string|object} [localUserID] - Same as in callstats.initialize().
 *                                         If unset, UA's identity is used.
 * @param  {function} [csInitCallback] - Same as in callstats.initialize().
 * @param  {function} [csStatsCallback] - Same as in callstats.initialize().
 * @param  {object} [configParams] - Same as in callstats.initialize().
 */
function handle(ua, AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams)
{
	logger.debug('handle()');

	if (typeof callstatsModule !== 'function')
		throw new TypeError('callstatsModule not found');

	if (typeof ua !== 'object')
		throw new TypeError('ua argument must be a JsSIP.UA instance');

	if (!localUserID)
	{
		localUserID =
		{
			userName  : ua.configuration.display_name,
			aliasName : ua.configuration.uri.toString()
		};
	}

	if (!csInitCallback)
	{
		csInitCallback = (csError, csErrMsg) =>
		{
			if (csError === 'success')
				logger.debug('csInitCallback success: %s', csErrMsg);
			else
				logger.warn('csInitCallback %s: %s', csError, csErrMsg);
		};
	}

	// Create and initialize the callstats object.

	let callstats = callstatsModule();

	callstats.initialize(AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams);

	// React on new JsSIP sessions.
	ua.on('newRTCSession', (data) =>
	{
		let session = data.session;
		let request = data.request;

		// Once 'connecting' is fired, the RTCPeerConnection is created.
		session.on('connecting', () =>
		{
			let conferenceID = session.data.conferenceID || request.getHeader('Call-ID');
			let sessionHandler = new SessionHandler(session, conferenceID, callstats);

			// Store the SessionHandler into the JsSIP.RTCSession data object.
			session.data.callstatsSessionHandler = sessionHandler;
		});
	});
};

/**
 * Set the callstats main module
 * @param  {function} module
 */
handle.setCallstatsModule = function(_module)
{
	logger.debug('setCallstatsModule()');

	callstatsModule = _module;
};

module.exports = handle;
