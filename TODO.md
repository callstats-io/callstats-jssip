# TODO

* Document API and building steps.

* In order to be a Bower package, the future owner of this library (callstats.io) must publish it to the Bower registry. Same for NPM.

* Document that `conferenceID` matches the SIP `Call-ID` header value. This may not be desirable if a B2BUA changes such a value. In that case, the app must set `session.data.conferenceID` within the `newRTCSession` event.
