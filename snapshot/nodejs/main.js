// Loading the hub
require('./hubu-all.js');

var index = require('./index');
var contact = require('./contact');
var contract = require('./contracts');
var server = require('./server');
var router = require('./router-impl');
var error = require('./error');

hub
    .registerComponent(router.component)
    .registerComponent(index.component)
    .registerComponent(server.component)
    .registerComponent(contact.component)
    .registerComponent(error.component)
    .start();