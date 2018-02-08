'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';



gulp.task('babel', function() {
	gulp.src('./src/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./dist/'))
});

gulp.task('js-watch', ['babel'], browserSync.reload);

gulp.task('serve', ['babel'], () => {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: './'
		}
	});
	gulp.watch('src/*.css').on('change', browserSync.reload);
	gulp.watch('*.html').on('change', browserSync.reload);
	gulp.watch('src/*.js', ['js-watch']);
});

gulp.task('default', ['babel', 'serve']);

gulp.task('watch', () => {
	gulp.watch('src/*.js', ['babel'])
});
