const gulp = require('gulp');
const fs = require('fs');
const clean = require('gulp-clean');
const plumber = require('gulp-plumber');
const fileInclude = require('gulp-file-include');
const htmlHint = require('gulp-htmlhint');
const autoprefixer = require('autoprefixer');
const cssImport = require('postcss-import');
const groupCssMedia = require('postcss-sort-media-queries');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const browserSyncInstance = require('browser-sync').create();
const newer = require('gulp-newer');
const global = require('./gulp-config');

const webpackConfig = {
  mode: 'none',
  output: {
    filename: global.isProduction() ? global.file.mainJsMin : global.file.mainJs,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/](node_modules|vendor_entries)[\\/]/,
          filename: global.isProduction() ? global.file.vendorJsMin : global.file.vendorJs,
        },
      },
    },
    minimize: global.isProduction(),
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new ESLintPlugin({ failOnError: false })],
  stats: 'errors-warnings',
};

gulp.task('delete', (done) => {
  const delFolders = [];

  if (fs.existsSync(`./${global.folder.dev}`)) delFolders.push(`./${global.folder.dev}`);
  if (fs.existsSync(`./${global.folder.build}`)) delFolders.push(`./${global.folder.build}`);

  if (delFolders.length) {
    return gulp.src(delFolders, { read: false })
      .pipe(clean({ force: true }));
  }

  done();
});

gulp.task('html', () => gulp.src(`./${global.buildHtml.templates}/**/*.html`)
  .pipe(plumber())
  .pipe(fileInclude({
    prefix: '@@',
    indent: true,
    basepath: global.buildHtml.templates,
    context: {
      mainJs: global.isProduction() ? global.file.mainJsMin : global.file.mainJs,
      vendorJs: global.isProduction() ? global.file.vendorJsMin : global.file.vendorJs,
      mainStyles: global.isProduction() ? global.file.mainStylesMin : global.file.mainStyles,
      vendorStyles: global.isProduction() ? global.file.vendorStylesMin : global.file.vendorStyles,
    },
  }))
  .pipe(gulp.dest(`./${global.folder.dev}`)));

gulp.task('html-hint', (done) => {
  gulp.src(`${global.folder.dev}/**/*.html`)
    .pipe(htmlHint({ 'attr-lowercase': false }))
    .pipe(htmlHint.reporter());
  done();
});

// Settings for all 'styles' tasks
const stylesPlugins = [
  autoprefixer(),
];
const stylesVendorsPlugins = [
  cssImport(),
];

if (global.isProduction()) {
  stylesPlugins.push(groupCssMedia({ sort: global.buildStyles.sortType }));
  stylesPlugins.push(cssnano());
  stylesVendorsPlugins.push(cssnano());
}

gulp.task('styles', () => gulp.src(`./${global.folder.src}/scss/${global.file.mainStylesSrc}`, { sourcemaps: !global.isProduction() })
  .pipe(rename(global.isProduction() ? global.file.mainStylesMin : global.file.mainStyles))
  .pipe(sass.sync({ sourceMap: !global.isProduction(), silenceDeprecations: ['legacy-js-api'] }))
  .pipe(postcss(stylesPlugins))
  .pipe(gulp.dest(`./${global.folder.dev}/css`, { sourcemaps: './' })));

gulp.task('styles-vendors', () => gulp.src(`./${global.folder.src}/vendor_entries/${global.file.vendorStylesSrc}`)
  .pipe(rename(global.isProduction() ? global.file.vendorStylesMin : global.file.vendorStyles))
  .pipe(sass.sync({ silenceDeprecations: ['legacy-js-api'] }))
  .pipe(postcss(stylesVendorsPlugins))
  .pipe(gulp.dest(`./${global.folder.dev}/css`)));

gulp.task('js', () => gulp.src(`./${global.folder.src}/js/*.js`)
  .pipe(babel())
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest(`./${global.folder.dev}/js`)));

gulp.task('images', () => gulp.src(`./${global.folder.src}/images/**/*`, { encoding: false })
  .pipe(newer(`./${global.folder.dev}/images`))
  .pipe(gulp.dest(`./${global.folder.dev}/images`)));

gulp.task('copy-files', () => gulp.src(global.getFilesToCopy(), { dot: true })
  .pipe(newer(`./${global.folder.dev}`))
  .pipe(gulp.dest(`./${global.folder.dev}`)));

gulp.task('copy-files-prod', () => gulp.src(global.getFilesToCopyProd(), { dot: true, encoding: false })
  .pipe(gulp.dest(`./${global.folder.build}`)));

gulp.task('browser-sync', () => browserSyncInstance.init({
  notify: false,
  injectChanges: false,
  minify: false,
  server: {
    baseDir: global.folder.dev,
    // If index.html exist - open it, else show folder
    directory: !fs.existsSync(`./${global.folder.dev}/${global.file.mainHtml}`),
  },
  port: 8080,
}));

gulp.task('watch', () => {
  gulp.watch(`./${global.folder.src}/scss/**/*.scss`, gulp.series('styles'));
  gulp.watch(`./${global.folder.src}/html/**/*.html`, gulp.series('html', 'html-hint'));
  gulp.watch(`./${global.folder.src}/images/**/*`, gulp.series('images'));
  gulp.watch(`./${global.folder.src}/js/**/*.js`, gulp.series('js'));
  gulp.watch([`./${global.folder.dev}/**`, `!./${global.folder.dev}/**/*.map`])
    .on('change', browserSyncInstance.reload)
    .on('unlink', browserSyncInstance.reload)
    .on('add', browserSyncInstance.reload);
});

gulp.task('default', gulp.series(
  'delete',
  gulp.parallel(
    gulp.series('html', 'html-hint'),
    gulp.series('styles', 'styles-vendors'),
  ),
  'js',
  'images',
  'copy-files',
  gulp.parallel('browser-sync', 'watch'),
));

gulp.task('build', gulp.series(
  'delete',
  gulp.parallel(
    gulp.series('html', 'html-hint'),
    gulp.series('styles', 'styles-vendors'),
  ),
  'js',
  'images',
  'copy-files',
  'copy-files-prod',
));
