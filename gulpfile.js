'use strict';

/**
 * Tasks:
 *
 * gulp prod
 *   Generates the library in production mode
 *
 * gulp dev
 *   Generates the library in development mode
 *
 * gulp live
 *   Generates the library in development mode and watches for changes
 *
 * gulp
 *   Alias for `gulp prod`
 */

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const watchify = require('watchify');
const del = require('del');
const envify = require('envify/custom');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const PKG = require('./package.json');
const BANNER = fs.readFileSync('banner.txt').toString();
const BANNER_OPTIONS =
{
	pkg         : PKG,
	currentYear : (new Date()).getFullYear()
};
const BUILD_DIR = './dist';

// Default environment
process.env.NODE_ENV = 'development';

function logError(error)
{
	gutil.log(gutil.colors.red(String(error)));
}

function bundle(options)
{
	options = options || {};

	let watch = !!options.watch;
	let bundler = browserify(
		{
			entries      : path.join(__dirname, PKG.main),
			extensions   : [ '.js' ],
			// required for sourcemaps (must be false otherwise)
			debug        : process.env.NODE_ENV === 'development',
			// required for watchify
			cache        : {},
			// required for watchify
			packageCache : {},
			// required to be true only for watchify
			fullPaths    : watch
		})
		.transform('babelify',
			{
				presets : [ 'es2015' ],
				plugins : [ 'transform-runtime', 'transform-object-assign' ]
			})
		.transform(envify(
			{
				NODE_ENV : process.env.NODE_ENV,
				_        : 'purge'
			}));

	if (watch)
	{
		bundler = watchify(bundler);

		bundler.on('update', () =>
		{
			let start = Date.now();

			gutil.log('bundling...');
			rebundle();
			gutil.log('bundle took %sms', (Date.now() - start));
		});
	}

	function rebundle()
	{
		return bundler.bundle()
			.on('error', logError)
			.pipe(source(`${PKG.name}.js`))
			.pipe(buffer())
			.pipe(rename(`${PKG.name}.js`))
			.pipe(gulpif(process.env.NODE_ENV === 'production',
				uglify()
			))
			.pipe(header(BANNER, BANNER_OPTIONS))
			.pipe(gulp.dest(BUILD_DIR));
	}

	return rebundle();
}

gulp.task('clean', () => del(BUILD_DIR, { force: true }));

gulp.task('env:dev', (done) =>
{
	gutil.log('setting "dev" environment');

	process.env.NODE_ENV = 'development';
	done();
});

gulp.task('env:prod', (done) =>
{
	gutil.log('setting "prod" environment');

	process.env.NODE_ENV = 'production';
	done();
});

gulp.task('lint', () =>
{
	let src = [ 'gulpfile.js', 'lib/**/*.js' ];

	return gulp.src(src)
		.pipe(plumber())
		.pipe(eslint(
			{
				plugins : [ 'import' ],
				extends : [ 'eslint:recommended' ],
				parserOptions :
				{
					ecmaVersion  : 6,
					sourceType   : 'module',
					ecmaFeatures :
					{
						impliedStrict : true
					}
				},
				envs :
				[
					'browser',
					'es6',
					'node',
					'commonjs'
				],
				'rules' :
				{
					'no-console'                    : 0,
					'no-undef'                      : 2,
					'no-unused-vars'                : [ 2, { vars: 'all', args: 'after-used' }],
					'no-empty'                      : 0,
					'quotes'                        : [ 2, 'single', { avoidEscape: true } ],
					'semi'                          : [ 2, 'always' ],
					'no-multi-spaces'               : 0,
					'no-whitespace-before-property' : 2,
					'space-before-blocks'           : 2,
					'space-before-function-paren'   : [ 2, 'never' ],
					'space-in-parens'               : [ 2, 'never' ],
					'spaced-comment'                : [ 2, 'always' ],
					'comma-spacing'                 : [ 2, { before: false, after: true } ],
					'jsx-quotes'                    : [ 2, 'prefer-single' ],
					'import/extensions'             : 1
				}
			}))
		.pipe(eslint.format());
});

gulp.task('bundle', () =>
{
	return bundle({ watch: false });
});

gulp.task('bundle:watch', () =>
{
	return bundle({ watch: true });
});

gulp.task('watch', (done) =>
{
	// Watch changes in JS files
	gulp.watch([ 'gulpfile.js', 'lib/**/*.js' ], gulp.series(
		'lint'
	));

	done();
});

gulp.task('prod', gulp.series(
	'env:prod',
	'clean',
	'lint',
	'bundle'
));

gulp.task('dev', gulp.series(
	'env:dev',
	'clean',
	'lint',
	'bundle'
));

gulp.task('live', gulp.series(
	'env:dev',
	'clean',
	'lint',
	'bundle:watch',
	'watch'
));

gulp.task('default', gulp.series('prod'));
