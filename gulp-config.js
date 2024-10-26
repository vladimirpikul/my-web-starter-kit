module.exports = {
  folder: {
    src: 'src',
    dev: 'assets',
    build: 'production',
  },
  file: {
    mainHtml: 'index.html',
    mainJs: 'app.js',
    mainJsMin: 'app.min.js',
    vendorJs: 'vendor.js',
    vendorJsMin: 'vendor.min.js',
    mainStylesSrc: 'styles.scss',
    mainStyles: 'styles.css',
    mainStylesMin: 'styles.min.css',
    vendorStylesSrc: 'vendor.scss',
    vendorStyles: 'vendor.css',
    vendorStylesMin: 'vendor.min.css',
  },
  buildHtml: {
    templates: 'src/html/templates',
  },
  buildStyles: {
    // Sorting type css media queries: 'desktop-first' || 'mobile-first'
    sortType: 'desktop-first',
  },
  getFilesToCopy() {
    return [
      `./${this.folder.src}/**`,
      `!{${this.folder.src}/images,${this.folder.src}/images/**}`,
      `!{${this.folder.src}/js,${this.folder.src}/js/**}`,
      `!{${this.folder.src}/html,${this.folder.src}/html/**}`,
      `!{${this.folder.src}/scss,${this.folder.src}/scss/**}`,
      `!{${this.folder.src}/vendor_entries,${this.folder.src}/vendor_entries/**}`,
    ];
  },
  getFilesToCopyProd() {
    return [
      `./${this.folder.dev}/**`,
    ];
  },
  isProduction() {
    return process.argv[process.argv.length - 1] === 'build';
  }
};
