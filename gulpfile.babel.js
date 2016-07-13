import gulp from 'gulp';
import load from 'gulp-load-plugins';

const src = 'src/**/*.js';
const dest = 'dist';
const binFile = `${dest}/cli.js`;
const watch = false
const $ = load();

gulp.task('js:build', () => {
  return gulp.src(src)
    .pipe($.changed(dest))
    .pipe($.babel({
      presets: ['es2015']
    }))
    .on('error', function(e) {
      console.log(e.stack)
      this.emit('end');
    })
    .pipe(gulp.dest(dest));
});

gulp.task('js:bin', ['js:build'], () => {
  return gulp.src(binFile)
    .pipe($.chmod(755))
    .pipe($.rename('uiscript'))
    .pipe(gulp.dest('bin/'));
});

gulp.task('clean', () => {
  return gulp.src([dest, 'bin/*'], { read: false })
    .pipe($.clean());
});

gulp.task('watch', function() {
  gulp.watch(src, ['default'])
});

gulp.task('default', ['js:build', 'js:bin'], () => {
  $.util.log($.util.colors.green('Rebuilt.'))
})
