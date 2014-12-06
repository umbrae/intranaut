var BaseStore = require('./base.jsx');
var DataURLStore = require('./dataurl.jsx');
var assign = require('object-assign');
var storage = require('../util/storage.js');

var REFRESH_TIME = 600;

var DEFAULT_CONFIG_TEMPLATE = {
  header: false,
  search: false,
  panels: []
}

var config = DEFAULT_CONFIG_TEMPLATE;
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
    this.touchLastFetch();
    storage.set('local', {
      config: JSON.stringify(config),
      configLastFetch: lastFetch
    });
    this.emitChange();
  },

  hasLoaded: function() {
    return loaded;
  },

  loadFromStorage: function() {
    storage.get('local', {
      configLastFetch: null,
      config: DEFAULT_CONFIG_TEMPLATE,
    }, function(items) {
      loaded = true;

      try {
        config = JSON.parse(items.config);
        lastFetch = items.configLastFetch;
      } catch(e) {
        config = DEFAULT_CONFIG_TEMPLATE;
        lastFetch = null;
      }

      if (_.isEmpty(config.panels) || (now() - lastFetch) > REFRESH_TIME) {
        this.loadFromDataURL();
      }

      this.emitChange();
    }.bind(this));
  },

  loadFromDataURL: function() {
    var url = DataURLStore.getDataURL();

    console.log("Loading " + url);

    if (!url) {
      console.log("No data URL, unable to load.");
      return;
    }

    $.get(url, function(response) {
      try {
        this.setConfig(JSON.parse(response));
      } catch(e) {
        alert("Unable to load config. There may be a problem with your configuration file? " +
              "Please check your options and contact your sysadmin.");
        return;
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = ConfigStore;