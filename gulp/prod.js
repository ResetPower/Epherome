const gulp = require("gulp");
const uglify = require("gulp-uglify");

module.exports = function () {
  return gulp
    .src("out")
    .pipe(uglify({ mangle: true }))
    .pipe(gulp.dest("out"));
};
