'use strict';

const Logger = require('./Logger');

const logger = new Logger('Handler');

class Handler
{
	constructor(ua, callstatsModule)
	{
		logger.debug('constructor()');

		// JsSIP.UA instance
		this._ua = ua;
		// Our callstats object
		this._callstats = callstatsModule();
	}

	/**
	 * Same API as the exposed by callstats.initialize() method.
	 * If localUserID is null, the display name and SIP URI of the JsSIP.UA
	 * instance are used.
	 */
	initialize(AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams)
	{
		logger.debug('initialize()');

		if (!localUserID)
		{
			localUserID =
			{
				userName  : this._ua.configuration.display_name,
				aliasName : this._ua.configuration.uri.toString()
			};
		}

		// Initialize the callstats object.
		this._callstats.initialize(AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams);

		// React on new JsSIP sessions
		this._ua.on('newRTCSession', (data) =>
		{
			let session = data.session;

			// Once 'connecting' is fired, the RTCPeerConnection is created.
			session.on('connecting', () =>
			{
				this._handleSession(session, session.connection);
			});
		});
	}

	_handleSession(session, peerconnection)
	{
		logger.debug('_handleSession() [session:%o, peerconnection:%o]', session, peerconnection);
	}
}

module.exports = Handler;
