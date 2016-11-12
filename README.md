# jssip-callstats

[jssip](http://jssip.net) interface to [callstats.io](http://callstats.io/).


## Install

* Using NPM: `$ npm install jssip-callstats`
* Using Bower: `$ bower install jssip-callstats`
* Adding a `<script>` tag in the HTML.

When using Bower or a `<script>` tag, the provided library is built with [browserify](http://browserify.org), which means that it can be used with any kind of JavaScript module loader system (AMD, CommonJS, etc) or, in case no module loaded is used, a global `window.jssipCallstats` is exposed.

**NOTE:** This library does not include the **callstats.io** library (it must be added separetely).


## Documentation

* Read the full [documentation](docs/index.md) in the docs folder.


## Usage example

In the HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load callstats.io library (it provides window.callstats -->
    <script src="https://api.callstats.io/static/callstats.min.js"></script>
    <!-- Load JsSIP library -->
    <script src="js/jssip.js"></script>
    <!-- Load jssip-callstats library (it provides window.jssipCallstats) -->
    <script src="js/jssip-callstats.js"></script>
    <!-- Load our app code -->
    <script src="js/app.js"></script>
  </head>

  <body>
    <!-- your stuff -->
  </body>
</html>
```

In `app.js`:

```javascript
// Create a JsSIP.UA instance
var ua = new JsSIP.UA(config);

// Run it
ua.start();

// Provide the jssip-callstats library with the UA, the callstats.io module
// and required parameters
jssipCallstats(ua, AppID, AppSecret);
```


## Development

Install NPM development dependencies:

```bash
$ npm install
```

Install `gulp-cli` 4.0 globally (which provides the `gulp` command):

```bash
$ npm install -g gulpjs/gulp-cli#4.0
```

* `gulp prod` generates a production/minified `dist/jssip-callstats.min.js` bundle.
* `gulp dev` generates a development non-minified and sourcemaps enabled `dist/jssip-callstats.js` bundle.


## Author

Iñaki Baz Castillo at Nimble Ape LTD (https://nimblea.pe).
