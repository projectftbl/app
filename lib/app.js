var Promise = require('bluebird')
  , path = require('path')
  , Server = require('@recipher/server')
  , log = require('@recipher/log')
  , utility = require('@recipher/utility')
  , configuration = require('@recipher/configuration')
  , Socket = require('@recipher/socket')
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

App.prototype.init = function(server) {
  return initialize(this.name, 'custom', path.join(this.folder, '..', 'initializers'), server).then(function() {

    if (server) {
      server.mount(this.folder);      
    } else {
      this.server.configure();
      this.dependencies.forEach(function(dependency) {
        dependency.init(this.server);
      }, this);
    }

    initialize(this.name, 'subscribers', this.folder, utility.folders(this.folder));
    initialize(this.name, 'listeners', this.folder, utility.folders(this.folder));

    return initialize(this.name, 'stores', this.folder, utility.folders(this.folder)).then(function() {
      if (!server) return this.server.prepare();
    }.bind(this));
  }.bind(this));
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
