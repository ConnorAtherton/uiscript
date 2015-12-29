import gulp from 'gulp'
import loadPlugins from 'gulp-load-plugins'

const $ = loadPlugins()
const src = './src/**/*'
const dist = './dist'

function runBabel() {
  return gulp.src(src)
    .pipe($.plumber(err => console.log(err.stack)))
    .pipe($.babel())
    .pipe($.plumber.stop())
    .pipe(gulp.dest(dist))
    .on('finish', () => {
      $.util.log('Babel build finished.')
    })
}

gulp.task('build', () => runBabel())
gulp.task('default', ['build'])

gulp.task('watch', ['build'], cb => {
  $.watch(src, () =>
    runBabel()
      .pipe($.watch(src))
      .pipe($.changed(src))
      .on('end', cb)
  )
})
