
var storageType = (typeof chrome !== "undefined" && typeof chrome.storage !== "undefined") ? "chrome" : "local";


var Storage = function() {}

Storage.prototype.get = function(type, items, cb) {
  if (storageType === "local") {
    var results = _.extend({}, items, _.object(_.map(items, function(item_default, item_key) {
      var result = localStorage[item_key];

      if (typeof result === "undefined") {
        return [item_key, item_default];
      }
      return [item_key, result];
    })));

    return cb(results);
  } else {
    if (type === "sync") {
      return chrome.storage.sync.get(items, cb);
    } else {
      return chrome.storage.local.get(items, cb);
    }
  }
}

Storage.prototype.set = function(type, items, cb) {
  if (storageType === "local") {
    _.each(items, function(item, item_key) {
      localStorage[item_key] = item;
    });

    if (typeof cb === "function") {
      return cb();
    }
  } else {
    if (type === "sync") {
      return chrome.storage.sync.set(items, cb);
    } else {
      return chrome.storage.local.set(items, cb);
    }
  }
}

module.exports = new Storage()