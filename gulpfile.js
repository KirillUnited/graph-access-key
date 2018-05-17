var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    path = require('path');

var dir = path.parse(path.dirname(__filename)).name;

gulp.task('browser-sync', ['styles'], function () {
    browserSync.init({
        server: {
            baseDir: "src"
        },
        notify: false
    });
});

gulp.task('styles', function () {
    return gulp.src('src/sass/*.sass')
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['last 15 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.stream());
});

gulp.task('clean', function () {
    return del.sync(dir); // Удаляем папку перед сборкой
});

gulp.task('build', function () {
    var build = gulp.src(['!src/sass/**/*', '!src/sass', 'src/**/*'])
        .pipe(gulp.dest(dir));
});

gulp.task('watch', ['browser-sync'], function () {
    gulp.watch('src/sass/*.sass', ['styles']);
    gulp.watch('src/**/*.js').on("change", browserSync.reload);
    gulp.watch('src/**/*.html').on('change', browserSync.reload);
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('default', ['browser-sync', 'watch']);