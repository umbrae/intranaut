var _ = require('underscore');
var $ = require('jquery');

var React = require('react')
var StylesStore = require('./stores/style.jsx');
var ConfigStore = require('./stores/config.jsx');

function normalizePath(path) {
  var a = document.createElement('a');
  a.href = path;
  return a.pathname;
}

module.exports = React.createClass({
  getInitialState: function() {
    return {
      lessPaths: [
        "../vendor/bootstrap/less/bootstrap.less",
        "../css/style.less"
      ]
    }
  },

  _onStylesChange: function() {
    if (this.isMounted()) {
      var cachedCSS = StylesStore.getCachedCSS();

      var lessCount = 0;
      _.each(this.state.lessPaths, function(path, i) {
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
          var styleVars = {};
          _.each(ConfigStore.getConfig().styles, function(style, key) {
            styleVars['@' + key] = style;
          });
          console.log(styleVars);
          less.modifyVars(styleVars);

          var cachedCss = {};
          _.each(document.getElementsByTagName('style'), function(el) {
            if (el.id.indexOf('less:') === 0) {
              StylesStore.setCachedCSSPath(el.id.replace('less:', ''), el.innerText);
              console.log('stored', el);
            }
          });
        });
      }
    }
  },

  componentDidMount: function () {
    if (StylesStore.hasLoaded()) {
      this._onStylesChange();
    }
    StylesStore.addChangeListener(this._onStylesChange);
  },

  render: function() {
    return <div />;
  }
});
