# Documentation


## API

The main module `callstatsjssip` is a function that receives a `JsSIP.UA` instance and parameters for `callstats.initialize()`.

The main module also exports a `setCallstatsModule()` function.


#### `callstatsjssip(ua, AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams)`

| Params  | Argument  | Type        | Description               |
|---------|-----------|-------------|---------------------------|
| `ua`    | Required  | `JsSIP.UA`  | JsSIP `UA` instance.      |

The rest of parameters match those in [callstats.initialize()](http://www.callstats.io/api/#callstats-initialize-with-app-secret), with a small difference:

* `localUserID` is not required. If `null`, the library fills it with an object containing the SIP URI and display name of the given `JsSIP.UA` instance.


#### `callstatsjssip.setCallstatsModule(module)`

| Params   | Argument  | Type        | Description                  |
|----------|-----------|-------------|------------------------------|
| `module` | Required  | `function`  | The `callstats` main module. |

By default this library uses `window.callstats` (assuming that the **callstats.io** library has been previously loaded via a `<script>` tag.

However, the **callstats.io** library can also be loaded using loaders such as [require.js](http://www.requirejs.org/) meaning that it may be not exposed as a global `window.callstats`. In that case, `callstatsjssip.setCallstatsModule()` can be used to provide the **callstats-jssip** library with the **callstats.io** main module.


### `SessionHandler` class

When a JsSIP `RTCSession` is created, the **callstats-jssip** library creates an instance of `SessionHandler` and stores it into `session.data.callstatsSessionHandler` to make it available to the application.

The `SessionHandler` class provides a wrapper over the API exposed by the `callstats` object, making it simpler by not requiring some parameters such as the `pcObject` or `conferenceID`.


#### `sessionHandler.callstats`

A getter that provides the already initialized `callstats` object.


#### `sessionHandler.associateMstWithUserID(userID, SSRC, usageLabel, associatedVideoTag)`

Arguments match those in [callstats.associateMstWithUserID()](http://www.callstats.io/api/#callstats-associatemstwithuserid).


#### `sessionHandler.reportUserIDChange(newUserID, userIDType)`

Arguments match those in [callstats.reportUserIDChange()](http://www.callstats.io/api/#callstats-reportuseridchange).


#### `sessionHandler.sendUserFeedback(feedback, pcCallback)`

Arguments match those in [callstats.sendUserFeedback()](http://www.callstats.io/api/#callstats-senduserfeedback).


## Tricks


### Custom `conferenceID` value

By default, when a new `JsSIP.RTCSession` is created, the `Call-ID` value of the incoming/outgoing INVITE request is used as callstats's `conferenceID`. This won't work in case the SIP server is a B2BUA that handles a different `Call-ID` for each peer within the same call/conference. In that case, the application can set a custom `conferenceID` by setting `session.data.conferenceID` as follows:

```javascript
// Create a JsSIP.UA instance
var ua = new JsSIP.UA(config);

// Run it
ua.start();

// Set custom conferenceID for created sessions
ua.on('newRTCSession', function(data) {
  var session = data.session;

  // Read our desired conferenceID from a custom X-Conference-ID set by the server
  session.data.conferenceID = session.getHeader('X-Conference-ID');
});

// Run the callstats-jssip library for this UA
callstatsjssip(ua, AppID, AppSecret);
```


