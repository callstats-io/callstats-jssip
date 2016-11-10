'use strict';

const Logger = require('./Logger');
const PKG = require('../package.json');

const logger = new Logger();

/**
 * Handles a JsSIP.UA instance and a callstats object.
 * @param  {JsSIP.UA} ua - The JsSIP.UA instance.
 * @param  {function} callstatsModule - The callstats main module. If null,
 *                                      window.callstats is used.
 * @param  {string} AppID - Same as in callstats.initialize().
 * @param  {string} AppSecretOrTokenGenerator - Same as in callstats.initialize().
 * @param  {string|object} [localUserID] - Same as in callstats.initialize().
 *                                         If unset, UA's identity is used.
 * @param  {function} [csInitCallback] - Same as in callstats.initialize().
 * @param  {function} [csStatsCallback] - Same as in callstats.initialize().
 * @param  {object} [configParams] - Same as in callstats.initialize().
 * @return {object} The callstats object.
 */
module.exports = function(ua, callstatsModule, AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams)
{
	logger.debug(`${PKG.name} v${PKG.version}`);

	if (typeof ua !== 'object')
		throw new TypeError('ua argument must be a JsSIP.UA instance');

	if (!callstatsModule)
		callstatsModule = window.callstats;

	if (typeof callstatsModule !== 'function')
		throw new TypeError('callstatsModule argument must be the callstats main module');

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

	// Initialize callstats.

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
			handleSession(session, request, callstats);
		});
	});

	return callstats;
};

function handleSession(session, request, callstats)
{
	logger.debug('handleSession()');

	let peerconnection = session.connection;
	// TODO: This should fire and event to let the app choose it.
	let conferenceID = request.getHeader('Call-ID');

	callstats.addNewFabric(
		// pcObject
		peerconnection,
		// remoteUserID
		{
			userName  : session.remote_identity.display_name,
			aliasName : session.remote_identity.uri.toString()
		},
		// fabricUsage (TODO)
		callstats.fabricUsage.multiplex,
		// conferenceID
		conferenceID,
		// pcCallback
		(err, msg) =>
		{
			if (err === 'success')
				logger.debug('pcCallback success: %s', msg);
			else
				logger.warn('pcCallback %s: %s', err, msg);
		}
	);

	session.on('getusermediafailed', (error) =>
	{
		logger.warn('session "getusermediafailed" event [error:%o]', error);

		reportError(callstats.webRTCFunctions.getUserMedia, error);
	});

	session.on('peerconnection:createofferfailed', (error) =>
	{
		logger.warn('session "peerconnection:createofferfailed" event [error:%o]', error);

		reportError(callstats.webRTCFunctions.createOffer, error);
	});

	session.on('peerconnection:createanswerfailed', (error) =>
	{
		logger.warn('session "peerconnection:createanswerfailed" event [error:%o]', error);

		reportError(callstats.webRTCFunctions.createOffer, error);
	});

	session.on('peerconnection:setlocaldescriptionfailed', (error) =>
	{
		logger.warn('session "peerconnection:setlocaldescriptionfailed" event [error:%o]', error);

		reportError(callstats.webRTCFunctions.setLocalDescription, error);
	});

	session.on('peerconnection:setremotedescriptionfailed', (error) =>
	{
		logger.warn('session "peerconnection:setremotedescriptionfailed" event [error:%o]', error);

		reportError(callstats.webRTCFunctions.setRemoteDescription, error);
	});

	session.on('failed', (data) =>
	{
		mayReportSignalingError(data.cause);
	});

	session.on('ended', (data) =>
	{
		mayReportSignalingError(data.cause);
	});

	function mayReportSignalingError(cause)
	{
		const causes = session.causes;

		switch (cause)
		{
			case causes.BYE:
			case causes.CANCELED:
			case causes.NO_ANSWER:
			case causes.EXPIRES:
			case causes.BUSY:
			case causes.REJECTED:
			case causes.REDIRECTED:
			case causes.UNAVAILABLE:
			case causes.NOT_FOUND:
			case causes.ADDRESS_INCOMPLETE:
			case causes.AUTHENTICATION_ERROR:
			{
				// Ignore.
				break;
			}
			default:
			{
				let error = new Error(cause);

				reportError(callstats.webRTCFunctions.signalingError, error);
			}
		}
	}

	function reportError(wrtcFuncName, error)
	{
		logger.warn('reportError() [wrtcFuncName:%s, error:%o]', wrtcFuncName, error);

		callstats.reportError(
			// pcObject
			peerconnection,
			// conferenceID
			conferenceID,
			// wrtcFuncName
			wrtcFuncName,
			// domError
			error,
			// localSDP
			peerconnection.localDescription ? peerconnection.localDescription.sdp : null,
			// remoteSDP
			peerconnection.remoteDescription ? peerconnection.remoteDescription.sdp : null
		);
	}
}
