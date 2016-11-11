# TODO

* Re-think the return value of `jssipCallstats()` since the app cannot call `sendUserFeedback()` on it without knowing the internally chosen `conferenceID`. In fact, `jssipCallstats()` must return another kind of object that exposes a `sendUserFeedback()` wrapper that does not require `conferenceID`.

* Handle hold, unhold, muted, etc.

* Implement `associateMstWithUserID`.

* In order to be a Bower package, the future owner of this library (callstats.io) must publish it to the Bower registry.
