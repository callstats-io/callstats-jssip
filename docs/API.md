# API

#### `jssipCallstats(ua, AppID, AppSecretOrTokenGenerator, localUserID, csInitCallback, csStatsCallback, configParams)`

| Params  | Argument  | Type        | Description               |
|---------|-----------|-------------|---------------------------|
| `ua`    | Required  | `JsSIP.UA`  | JsSIP `UA` instance.      |

The rest of parameters match those in [callstats.initialize()](http://www.callstats.io/api/#callstats-initialize-with-app-secret), with a small difference:

* `localUserID` is not required. If `null`, the library fills it with an object containing the SIP URI and display name of the given `JsSIP.UA` instance.
