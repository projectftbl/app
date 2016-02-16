var Promise = require('bluebird')
  , path = require('path')
  , Server = require('@ftbl/server')
  , log = require('@ftbl/log')
  , utility = require('@ftbl/utility')
  , configuration = require('@ftbl/configuration')
  , Socket = require('@ftbl/socket')
  , initialize = require('./initializers');

var App = function(name, folder) {
  if (this instanceof App === false) return new App;

  this.name = name;
  this.folder = path.join(folder, 'apps');
  this.server = new Server(name, this.folder);

  this.dependencies = Array.prototype.slice.call(arguments, 2);
};

var logError = function(err) {
  log.error(err, err.stack);
};

var mount = function() {
  this.dependencies.forEach(function(dependency) {
    dependency.init(this.server);
  }, this);
};

App.prototype.init = function(master) {
  if (master) {
    master.mount(this.folder);      
  } else {
    this.server.configure();
    mount.call(this);
    this.server.prepare();
  }

  initialize(this.name, 'subscribers', this.folder, utility.folders(this.folder));
  initialize(this.name, 'listeners', this.folder, utility.folders(this.folder));
  initialize(this.name, 'jobs', this.folder, utility.folders(this.folder));

  return initialize(this.name, 'stores', this.folder, utility.folders(this.folder));
};

App.prototype.start = function(done) {
  var name = this.name
    , server = this.server;

  return this.init()
  
  .then(function() {
    server.start(done);

    new Socket(name, server.server).listen();
  })
  
  .catch(logError);
};

App.prototype.stop = function(done) {
  this.server.stop(done);
};

module.exports = App;
