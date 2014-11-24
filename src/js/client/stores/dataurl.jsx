var BaseStore = require('./base.jsx');
var assign = require('object-assign');

var dataURL = null;

var DataURLStore = assign({}, BaseStore, {
  getDataURL: function() {
    return dataURL;
  },

  setDataURL: function(url) {
    dataURL = url;
    this.emitChange();
  },

  loadFromStorage: function() {
    chrome.storage.sync.get({
      dataURL: dataURL
    }, function(items) {
      dataURL = items.dataURL;
      this.emitChange();
    }.bind(this));
  }
});

module.exports = DataURLStore;