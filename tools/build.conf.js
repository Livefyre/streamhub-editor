({
  mainConfigFile: '../requirejs.conf.js',
  paths: {
    jquery: 'lib/jquery/jquery.min',
    almond: 'lib/almond/almond'
  },
  baseUrl: '..',
  name: "streamhub-editor",
  include: [
    'almond',
    'streamhub-editor/auth-editor'
  ],
  exclude:  ['css/normalize', 'less/normalize'],
  stubModules: ['text', 'hgn'],
  out: "../dist/streamhub-editor.min.js",
  buildCSS: true,
  separateCSS: true,
  pragmasOnSave: {
    excludeHogan: true,
    excludeRequireCss: true
  },
  cjsTranslate: true,
  optimize: "none",
  preserveLicenseComments: false,
  uglify2: {
    compress: {
      unsafe: true
    },
    mangle: true
  },
  wrap: {
    startFile: 'wrap-start.frag',
    endFile: 'wrap-end.frag'
  },
  generateSourceMaps: true,
  onBuildRead: function(moduleName, path, contents) {
    switch (moduleName) {
      case "jquery":
        contents = "define([], function(require, exports, module) {" + contents + "});";
    }
    return contents;
  }
})
