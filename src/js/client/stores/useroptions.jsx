var BaseStore = require('./base.jsx');
var assign = require('object-assign');
var storage = require('../util/storage.js');

var panelOrder = [];
var customLinks = [];
var hiddenPanels = [];

UserOptionsStore = assign({}, BaseStore, {
  getPanelOrder: function() {
    return panelOrder;
  },

  getCustomLinks: function() {
    return customLinks;
  },

  getHiddenPanels: function() {
    return hiddenPanels;
  },

  setHiddenPanels: function(panels) {
    hiddenPanels = panels;
    storage.set('local', {
      hiddenPanels: JSON.stringify(hiddenPanels)
    });
    this.emitChange();
  },

  setPanelOrder: function(order) {
    panelOrder = order;
    storage.set('local', {
      panelOrder: JSON.stringify(order)
    });
    this.emitChange();
  },

  setCustomLinks: function(links) {
    customLinks = links;
    storage.set('local', {
      customLinks: JSON.stringify(links)
    });
    this.emitChange();
  },

  loadFromStorage: function() {
    storage.get('local', {
      panelOrder: [],
      customLinks: [],
      hiddenPanels: []
    }, function(items) {
      try {
        panelOrder = JSON.parse(items.panelOrder);
      } catch(e) {
        panelOrder = [];
      }

      try {
        customLinks = JSON.parse(items.customLinks);
      } catch(e) {
        customLinks = [];
      }

      try {
        hiddenPanels = JSON.parse(items.hiddenPanels);
      } catch(e) {
        hiddenPanels = [];
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = UserOptionsStore;