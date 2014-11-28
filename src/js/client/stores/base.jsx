var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var BaseStore = assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit('change');    
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  }
});

module.exports = BaseStore;