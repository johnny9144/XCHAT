var gulp = require('gulp');
var symlink = require('gulp-sym');
var replace = require('gulp-replace');
var gulpsync = require('gulp-sync')(gulp);
var rename = require("gulp-rename");
var gutil = require('gulp-util');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
// var request = require('request');
var del = require('del'); 
var uglify = require('gulp-uglify');
var viewFolder = './views';
var orgLayout = viewFolder+'/layout_org.ejs';
var tmpLayoutName = 'layout_tmp.ejs';
var tmpLayout = viewFolder+'/'+tmpLayoutName;
var finalLayoutName = 'layout.ejs';
var finalLayout = viewFolder+'/'+finalLayoutName;
var js = [
  "./public/js/jquery.min.js",
  "./public/bootstrap/js/bootstrap.min.js",
  "./public/animsition/js/animsition.min.js",
  "./public/js/jquery.ui.min.js"
];

var jsOther = [
  "./public/js/chat.js"
];

gulp.task('other_js', function(){
  return gulp.src(jsOther)
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./public/jsOut'));
});

gulp.task('scripts', function(){
  return gulp.src(js)
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(gulp.dest('./public/jsOut'));
});


gulp.task('copy_layout', function(){                                                                   
  return gulp.src(orgLayout)   
  .pipe(rename(tmpLayoutName ))      
  .pipe(gulp.dest(viewFolder));   
});

gulp.task('inject', function(){
  var src = gulp.src('./public/jsOut/all.js', {read: false});
  return gulp.src(tmpLayout)
    .pipe(inject(src, {relative: false}))
    .pipe(gulp.dest(viewFolder));
});

gulp.task('inject_replace', function(){
  return gulp.src([tmpLayout])
    .pipe(replace('/public/jsOut', '/s/jsOut'))
    .pipe(gulp.dest(viewFolder));
});

gulp.task('sym_layout', function(){
  return gulp.src(tmpLayout)
    .pipe(symlink(finalLayout, {force:true, relative:true}));
});

// gulp.task('sym_dev_js', function(){
//   return gulp.src('./public/jsSrc')
//     .pipe(symlink('./public/js', {force:true, relative:true}));
// });

// gulp.task('sym_js', function(){
//   return gulp.src('./public/jsOut')
//     .pipe(symlink('./public/js', {force:true, relative:true}));
// });

// gulp.task('clean:tmp_layout', function(){
//   return del([tmpLayout]);
// });
//
// gulp.task('clean:final_layout', function(){
//   return del([finalLayout]);
// });

gulp.task('clean:all', function(){
  return del([finalLayout, tmpLayout, './public/jsOut']);
});

gulp.task('default', gulpsync.sync([
  'clean:all',
  'scripts', 'other_js', 
  'copy_layout', 'inject', 'inject_replace', 'sym_layout']));