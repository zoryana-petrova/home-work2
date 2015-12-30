/* --------- plugins --------- */

var
	gulp        = require('gulp'),
	compass     = require('gulp-compass'),
	jade        = require('gulp-jade'),
	browserSync = require('browser-sync').create(),
	browserify  = require('gulp-browserify'),
	uglify      = require('gulp-uglify'),
	rename      = require("gulp-rename"),
	plumber     = require('gulp-plumber'),
	concat      = require('gulp-concat'),
	htmlmin 		= require('gulp-html-minifier'),
	rimraf 			= require('gulp-rimraf'),
	rename 			= require('gulp-rename'),
	minifyCss   = require('gulp-minify-css'),
	bowerFiles 	= require('main-bower-files');

/* --------- paths --------- */

var
	paths = {
		env: {
			dev: 'app/',
			prod: 'dist/'
		},
		jade : {
			location    : 'markups/**/*.jade',
			compiled    : 'markups/_pages/*.jade'
		},

		scss : {
			location    : 'styles/**/*.scss'
		},

		compass : {
			cssFolder   : 'css',
			scssFolder  : 'styles',
			imgFolder   : 'img',
			jsFolder		: 'js'
		},

		js : {
			location    : 'scripts/main.js',
			plugins     : 'scripts/_plugins/*.js',
			destination : 'js'
		},

		fontsFolder: "fonts/",

		browserSync : {
			watchPaths : ['*.html', 'css/*.css', 'js/*.js']
		},

		bower: {
			bowerrc: '.bowerrc',
			bowerjson: 'bower.json',
			bowerdir: 'bower/'
		}
	}

/* --------- jade --------- */

gulp.task('jade', function() {
	gulp.src(paths.jade.compiled)
		.pipe(plumber())
		.pipe(jade({
			pretty: '\t',
		}))
		.pipe(gulp.dest(paths.env.dev));
});


gulp.task('jade-dist', function(){
	gulp.src(paths.jade.compiled)
		.pipe(plumber())
		.pipe(jade())
		.pipe(gulp.dest(paths.env.prod));
})

/* --------- scss-compass --------- */

gulp.task('compass', function() {
	var imgFolder = paths.compass.imgFolder,
			cssFolder = paths.compass.cssFolder,
			scssFolder = paths.compass.scssFolder;

	gulp.src(paths.scss.location)
		.pipe(plumber())
		.pipe(compass({
			css: paths.env.dev + cssFolder,
			sass: scssFolder,
			image: paths.env.dev + imgFolder,
			relative: true,
			comments: false,
			http_path: '/',
			style: 'expanded',
			require: [
				'compass',
				'sass-globbing'
			]
		}));
});

gulp.task('compass-dist', ['compass'], function() {
	var imgFolder = paths.compass.imgFolder,
			cssFolder = paths.compass.cssFolder,
			fontsFolder = paths.cssFolder + '/' + paths.fontsFolder;

	gulp.src([paths.env.dev + imgFolder + '/**/*'])
			.pipe(gulp.dest(paths.env.prod + imgFolder));

	gulp.src([paths.env.dev + cssFolder + '/**/*.css'])
	    .pipe(minifyCss({compatibility: 'ie8'}))
			.pipe(gulp.dest(paths.env.prod + cssFolder));
})



/* --------- fonts  --------- */
gulp.task('fonts', function(){
	gulp.src([paths.fontsFolder + '**/*'])
			.pipe(gulp.dest(paths.env.dev + paths.fontsFolder));
});

gulp.task('fonts-dist', function(){
	gulp.src([paths.fontsFolder + '**/*'])
			.pipe(gulp.dest(paths.env.prod + paths.fontsFolder));
});

/* --------- browser sync --------- */

gulp.task('sync', function() {
	browserSync.init({
		server: {
			baseDir: './' + paths.env.dev
		}
	});
});


gulp.task('sync-dist', function() {
	browserSync.init({
		server: {
			baseDir: './' + paths.env.prod
		}
	});
});

/* --------- plugins --------- */
gulp.task('plugins', function () {
	gulp.src(bowerFiles({
			paths: {
        bowerDirectory: paths.bower.bowerdir,
        bowerrc: paths.bower.bowerrc,
        bowerJson: paths.bower.bowerjson
    	},
    	filter: /.*js$/
  	})
	).pipe(plumber())
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest(paths.env.dev + paths.js.destination))
		.pipe(rename('plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.env.dev + paths.js.destination));
	
});


gulp.task('plugins-dist', function() {
	gulp.src(bowerFiles({
			paths: {
        bowerDirectory: paths.bower.bowerdir,
        bowerrc: paths.bower.bowerrc,
        bowerJson: paths.bower.bowerjson
    	},
    	filter: /.*js$/
  	})
	).pipe(plumber())
		.pipe(concat('plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.env.prod + paths.js.destination));
});

/* --------- plugins --------- */

gulp.task('scripts', function() {
	return gulp.src(paths.js.location)
		.pipe(plumber())
		.pipe(rename('main.js'))
		.pipe(gulp.dest(paths.env.dev + paths.js.destination))
		.pipe(uglify())
		.pipe(rename('main.min.js'))
		.pipe(gulp.dest(paths.env.dev + paths.js.destination));
});

gulp.task('scripts-dist', function() {
	return gulp.src(paths.js.location)
		.pipe(plumber())
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.env.prod + paths.js.destination));
});


/* --------- watch --------- */

gulp.task('watch', function(){
	gulp.watch(paths.jade.location, ['jade']);
	gulp.watch(paths.scss.location, ['compass']);
	gulp.watch(paths.js.location, ['scripts']);
	gulp.watch(paths.js.plugins, ['plugins']);
	gulp.watch(paths.browserSync.watchPaths.map(function(path) {
  	return paths.env.dev + path;
	})).on('change', browserSync.reload);
});

gulp.task('watch-dist', function(){
	gulp.watch(paths.jade.location, ['jade']);
	gulp.watch(paths.scss.location, ['compass']);
	gulp.watch(paths.js.location, ['scripts']);
	gulp.watch(paths.js.plugins, ['plugins']);
	gulp.watch(paths.browserSync.watchPaths.map(function(path) {
  	return paths.env.prod + path;
	})).on('change', browserSync.reload);
});

/* --------- clean --------- */
gulp.task('clean', function(cb){
	gulp.src([
		paths.env.dev + paths.compass.jsFolder,
		paths.env.dev + paths.compass.cssFolder,
		paths.env.dev + paths.fontsFolder,
		paths.env.dev + '/*.html',
	])
	.pipe(rimraf({force:true}));

	cb();
});


gulp.task('clean-dist', function(cb){
	gulp.src(paths.env.prod)
			.pipe(rimraf({force:true}));

	cb();
});

/* --------- default --------- */

gulp.task('default', ['jade', 'fonts', 'compass', 'plugins', 'scripts', 'sync', 'watch']);
gulp.task('dist', ['jade-dist', 'fonts-dist', 'compass-dist',  'plugins-dist', 'scripts-dist', 'sync-dist', 'watch-dist']);
