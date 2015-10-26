var express = require('express');
var lessMiddleware = require('less-middleware');
var pubDir = __dirname + '/..';

var app = express();

app.use(lessMiddleware({
    src: '/src/styles',
    dest: '/dev/css',
    compress: false,
    force: true,
    root: pubDir,
    paths: [pubDir, 'lib']
}));

app.use('/', express.static(pubDir));
app.listen(8080);
