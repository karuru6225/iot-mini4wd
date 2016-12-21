const gulp = require('gulp');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const del = require('del');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const distDir = './dist/';

gulp.task('clean-js', ()=>{
  return del([
    distDir + '**/*'
  ]);
});

gulp.task('copy-js', ['clean-js'], ()=>{
  return gulp.src([
    './src/config.js'
  ])
  .pipe(plumber())
  .pipe(gulp.dest(distDir))
});

gulp.task('compile', ['copy-js'], ()=>{
  return gulp.src([
    './src/**/*.js'
  ])
  .pipe(plumber())
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest(distDir));
});

gulp.task('build', ['compile']);

gulp.task('watch', ['build'], ()=>{
  watch([
    './src/**/*.js'
  ], ()=>{
    gulp.start('compile');
  });
});

gulp.task('default', ()=>{
  function spawn(){
    const proc = require('child_process').spawn('gulp', ['watch'], {stdio: 'inherit'});
    proc.on('close', (c)=>{
      spawn();
    });
  }
  spawn();
});
