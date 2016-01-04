var initialize = require('@ftbl/initializer');

module.exports = function(app) {
  var args = Array.prototype.slice.call(arguments, 1);

  return initialize(app, __dirname).apply(null, args);
};