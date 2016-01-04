var Promise = require('bluebird')
  , initialize = require('./initializers')
  , utility = require('@ftbl/utility');

var App = function(name, folder) {
  if (this instanceof App === false) return new App(name, folder);

  this.name = name;
  this.folder = path.join(folder, 'apps');
};

App.prototype.start = function(done) {
  initialize(this.name, 'subscribers', this.folder, utility.folders(this.folder));
  initialize(this.name, 'listeners', this.folder, utility.folders(this.folder));

  done();
};

App.prototype.stop = function(done) {
  // No op
};

module.exports = App;
