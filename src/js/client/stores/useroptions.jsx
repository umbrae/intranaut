var BaseStore = require('./base.jsx');
var assign = require('object-assign');

var panelOrder = null;
var customLinks = [];

UserOptionsStore = assign({}, BaseStore, {
  getPanelOrder: function() {
    return panelOrder;
  },

  getCustomLinks: function() {
    return customLinks;
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
      panelOrder: null,
      customLinks: null,
    }, function(items) {
      try {
        panelOrder = JSON.parse(items.panelOrder);
        customLinks = JSON.parse(items.customLinks);
      } catch(e) {
        panelOrder = null;
        customLinks = null;
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = UserOptionsStore;