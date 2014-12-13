var BaseStore = require('./base.jsx');
var assign = require('object-assign');
var storage = require('../util/storage.js');

var customStyles = [];
var cachedCSS = {};

StylesStore = assign({}, BaseStore, {
  getCustomStyles: function() {
    return customStyles;
  },

  setCustomStyles: function(panels) {
    customStyles = panels;
    storage.set('local', {
      customStyles: JSON.stringify(customStyles)
    });
    this.emitChange();
  },

  getCachedCSS: function() {
    return cachedCSS;
  },

  setCachedCSSPath: function(uri, css) {
    cachedCSS[uri] = css;
    storage.set('local', {
      cachedCSS: JSON.stringify(cachedCSS)
    })
    this.emitChange();
  },

  loadFromStorage: function(cb) {
    storage.get('local', {
      customStyles: [],
      cachedCSS: {}
    }, function(items) {
      try {
        customStyles = JSON.parse(items.customStyles);
      } catch(e) {
        customStyles = [];
      }

      try {
        cachedCSS = JSON.parse(items.cachedCSS);
      } catch(e) {
        cachedCSS = {};
      }

      if (typeof(cb) !== "undefined") {
        cb();
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = StylesStore;