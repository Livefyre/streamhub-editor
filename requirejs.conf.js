require.config({
  paths: {
    base64: 'lib/base64/base64',
    chai: 'lib/chai/chai',
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    hgn: 'lib/requirejs-hogan-plugin/hgn',
    hogan: 'lib/requirejs-hogan-plugin/hogan',
    inherits: 'lib/inherits/inherits',
    jquery: 'lib/jquery/jquery',
    json: 'lib/requirejs-plugins/src/json',
    mocha: 'lib/mocha/mocha',
    mustache: 'lib/mustache/mustache',
    mout: 'lib/mout/src',
    observer: 'lib/observer/src/observer',
    text: 'lib/requirejs-hogan-plugin/text',
    sinon: 'lib/sinonjs/sinon',
    'sinon-chai': 'lib/sinon-chai/lib/sinon-chai',
    debug: 'lib/debug/debug'
  },
  packages: [
    {
      name: "streamhub-ui",
      location: "lib/streamhub-ui/src"
    },{
      name: "streamhub-sdk",
      location: "lib/streamhub-sdk/src"
    },{
      name: "streamhub-sdk/auth",
      location: "lib/streamhub-sdk/src/auth"
    },{
      name: "streamhub-sdk/collection",
      location: "lib/streamhub-sdk/src/collection"
    },{
      name: "streamhub-sdk/content",
      location: "lib/streamhub-sdk/src/content"
    },{
      name: "streamhub-sdk/modal",
      location: "lib/streamhub-sdk/src/modal"
    },{
      name: "streamhub-sdk/jquery",
      location: "lib/streamhub-sdk/src",
      main: "jquery"
    },{
      name: "streamhub-sdk-tests",
      location: "lib/streamhub-sdk/tests"
    },{
      name: 'streamhub-editor',
      location: 'src/javascript'
    },{
      name: 'streamhub-editor/styles',
      location: 'src/styles'
    },{
      name: 'streamhub-editor/templates',
      location: 'src/templates'
    },{
      name: "streamhub-sdk/ui",
      location: "lib/streamhub-sdk/src/ui"
    },{
      name: "auth",
      location: "lib/auth/src"
    },{
    name: "stream",
    location: "lib/stream/src"
    },{
      name: "livefyre-auth",
      location: "lib/livefyre-auth/src"
    },{
      name: "livefyre-auth-tests",
      location: "lib/livefyre-auth/test"
    },{
      name: 'view',
      location: 'lib/view/src',
      main: 'view'
    },{
      name: "css",
      location: "lib/require-css",
      main: "css"
    },{
      name: "less",
      location: "lib/require-less",
      main: "less"
    }
  ],
  shim: {
    jquery: {
      exports: '$'
    },
    'sinon': {
      exports: 'sinon'
    }
  },
  css: {
    clearFileEachBuild: 'dist/streamhub-editor.min.css',
    transformEach: []
  },
  less: {
    browserLoad: 'dist/streamhub-editor.min',
    paths: ['lib'],
    relativeUrls: true,
    modifyVars: {
      '@icon-font-path': "\"http://cdn.livefyre.com/libs/livefyre-bootstrap/v1.1.0/fonts/\""
    }
  }
});
