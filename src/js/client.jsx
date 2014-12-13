var React = require('react/addons')
var Intranaut = require('./client/intranaut.jsx');

var root = document.getElementById('intranaut');
var isOptions = root.dataset.options;

var StylesStore = require('./client/stores/style.jsx');

var less_paths = ["../vendor/bootstrap/less/bootstrap.less"];

function normalizePath(path) {
  var a = document.createElement('a');
  a.href = path;
  return a.pathname;
}

StylesStore.loadFromStorage(function() {
  var cachedCSS = StylesStore.getCachedCSS();

  var lessCount = 0;
  _.each(less_paths, function(path, i) {
    var normalizedPath = normalizePath(path);
    if (document.getElementById('css:' + normalizedPath) || document.getElementById('less:' + normalizedPath)) {
      console.log('existed', normalizedPath);
      return;
    }

    if (typeof cachedCSS[normalizedPath] !== "undefined") {
      console.log("was cached:", normalizedPath);
      var s = document.createElement('style');
      s.type = "text/css";  
      s.innerText = cachedCSS[normalizedPath];
      s.id = "css:" + normalizedPath;
      document.head.appendChild(s);
    } else {
      lessCount++;
      var l = document.createElement('link');
      l.rel = "stylesheet/less";
      l.type = "text/css";
      l.title = normalizedPath;
      l.href = normalizedPath;
      document.head.appendChild(l);
    }
  });    

  if (lessCount > 0) {
    less.registerStylesheets();
    less.refresh().then(function() {
      var cachedCss = {};
      _.each(document.getElementsByTagName('style'), function(el) {
        if (el.id.indexOf('less:') === 0) {
          StylesStore.setCachedCSSPath(el.id.replace('less:', ''), el.innerText);
          console.log('stored', el);
        }
      });
    });
  }
});

/* jshint ignore:start */
React.renderComponent(<Intranaut isOptions={isOptions} />, root);
/* jshint ignore:end */
