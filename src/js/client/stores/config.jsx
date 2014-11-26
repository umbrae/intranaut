var BaseStore = require('./base.jsx');
var assign = require('object-assign');

var config = {
  header: false,
  search: false,
  panels: []
};

var lastFetch = null;

var loaded = false;

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
  },

  hasLoaded: function() {
    return loaded;
  },

  loadFromStorage: function() {
    chrome.storage.local.get({
      configLastFetch: null,
      config: null,
    }, function(items) {
      loaded = true;

      try {
        config = JSON.parse(items.config);
        lastFetch = items.configLastFetch;
      } catch(e) {
        config = null;
        lastFetch = null;
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = ConfigStore;