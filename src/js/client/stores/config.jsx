var BaseStore = require('./base.jsx');
var assign = require('object-assign');

var config = {
  header: false,
  search: false,
  panels: []
};
var lastFetch = null;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

ConfigStore = assign({}, BaseStore, {
  getLastFetch: function() {
    return lastFetch;
  },

  touchLastFetch: function() {
    lastFetch = now();
    this.emitChange();
  },

  getConfig: function() {
    return config;
  },

  setConfig: function(cfg) {
    config = cfg;
    this.emitChange();
  }
});

module.exports = ConfigStore;