var BaseStore = require('./base.jsx');
var assign = require('object-assign');

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
    chrome.storage.local.set({
      hiddenPanels: JSON.stringify(hiddenPanels)
    });
    this.emitChange();
  },

  setPanelOrder: function(order) {
    panelOrder = order;
    chrome.storage.local.set({
      panelOrder: JSON.stringify(order)
    });
    this.emitChange();
  },

  setCustomLinks: function(links) {
    customLinks = links;
    chrome.storage.local.set({
      customLinks: JSON.stringify(links)
    });
    this.emitChange();
  },

  loadFromStorage: function() {
    chrome.storage.local.get({
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