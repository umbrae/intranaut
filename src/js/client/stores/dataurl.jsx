var BaseStore = require('./base.jsx');
var assign = require('object-assign');
var storage = require('../util/storage.js');

var dataURL = null;

var DataURLStore = assign({}, BaseStore, {
  getDataURL: function() {
    return dataURL;
  },

  setDataURL: function(url) {
    dataURL = url;
    storage.set('sync', {
      dataURL: url
    });
    this.emitChange();
  },

  loadFromStorage: function() {
    storage.get('sync', {
      dataURL: dataURL
    }, function(items) {
      dataURL = items.dataURL;

      if (!dataURL) {
        storage.get('sync', {
          data_url: dataURL
        }, function(items) {
           if (items.data_url) {
             console.log("Restoring data URL from old data URL", items);
             this.setDataURL(items.data_url);
           }
        }.bind(this))
      }

      this.emitChange();
    }.bind(this));
  }
});

module.exports = DataURLStore;