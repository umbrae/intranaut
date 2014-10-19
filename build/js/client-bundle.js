(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */var Intranaut = require('./client/intranaut.jsx');

/* jshint ignore:start */
React.renderComponent(Intranaut(null), document.getElementById('switcher'));
/* jshint ignore:end */

},{"./client/intranaut.jsx":2}],2:[function(require,module,exports){
/** @jsx React.DOM */var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      header: false,
      search: false,
      panels: [],
    };
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    chrome.storage.local.get({
      'config_last_fetch': null,
      'config': null
    }, function(items) {
      var lastFetch = items.config_last_fetch;
      var config;

      if (items.config) {
        try {
          config = JSON.parse(items.config);
        } catch(e) {
          lastFetch = null;
          config = null;
        }
      }

      if (lastFetch && config && this.isMounted()) {
        this.setState(config);
      }

      if (!lastFetch || (now() - lastFetch) > REFRESH_TIME) {
        this.syncConfig(lastFetch == null); 
      }
    }.bind(this));
  },

  /**
   * Synchronize the config from the remote store to local storage.
   * @param renderAfterSync bool - if true, run renderConfig after loading.
  **/
  syncConfig: function(renderAfterSync) {
    chrome.storage.sync.get('data_url', function(items) {
      $.get(items.data_url, function(response) {
        try {
          var config = JSON.parse(response);
        } catch(e) {
          alert("Unable to load config. There may be a problem with your configuration file? " +
                "Please check your options and contact your sysadmin.");
          return;
        }

        chrome.storage.local.set({
          'config_last_fetch': now(),
          'config': JSON.stringify(config)
        });

        if (renderAfterSync) {
          this.setState(config);
        }
      }.bind(this));
    }.bind(this));
  },

  render: function() {
    return (
      /* jshint ignore:start */
      React.DOM.div(null, 
        NavBar({
          header: this.state.header, 
          search: this.state.search}), 
        PanelList({
          panels: this.state.panels})
      )
      /* jshint ignore:end */
    );
  }
});

},{"./nav_bar.jsx":3,"./panel_list.jsx":6}],3:[function(require,module,exports){
/** @jsx React.DOM */module.exports = React.createClass({displayName: 'exports',
  getDefaultProps: function() {
    return {
      header: {
        name: "intranaut",
        logo: false,
        url: false
      },
      search: false
    }
  },

  render: function() {
    var logoEl;
    var searchEl;

    if (this.props.header.logo) {
      logoEl = React.DOM.img({src: this.props.header.logo, className: "logo"})
    } else {
      logoEl = false;
    }

    if (this.props.search) {
      searchEl = (
        React.DOM.form({id: "search", className: "navbar-form navbar-right", role: "form", method: "get", action: this.props.search.url}, 
          React.DOM.div({className: "input-group"}, 
            React.DOM.input({type: "text", id: "searchString", name: this.props.search.searchParam, className: "form-control", placeholder: this.props.search.placeholder}), 
            React.DOM.span({className: "input-group-btn"}, 
              React.DOM.button({className: "btn btn-success", type: "submit"}, this.props.search.button_title)
            )
          )
        )
      )
    } else {
      searchEl = false;
    }

    return (
      /* jshint ignore:start */
      React.DOM.div({className: "navbar", role: "navigation"}, 
        React.DOM.div({className: "container"}, 
          React.DOM.div({className: "navbar-header"}, 
            React.DOM.a({className: "navbar-brand", href: this.props.header.url}, 
              logoEl, 
              React.DOM.span({className: "navbar-brand-name"}, this.props.header.name)
            )
          ), 
          searchEl
        )
      )
      /* jshint ignore:end */
    );
  }
});

},{}],4:[function(require,module,exports){
/** @jsx React.DOM */var PanelItem = require('./panel_item.jsx');

module.exports = React.createClass({displayName: 'exports',
  render: function() {
    return (
      /* jshint ignore:start */
      React.DOM.li({className: "col-md-4", id: this.props.id}, 
        React.DOM.div({className: "panel panel-success"}, 
          React.DOM.div({className: "panel-heading"}, 
            React.DOM.span({className: "panel-name"}, this.props.name), 
            React.DOM.span({className: "pull-right glyphicon glyphicon-th"})
          ), 
          React.DOM.div({className: "list-group"}, 
            this.props.contents.map(function(panelItem, i) {
              return PanelItem(panelItem);
            }.bind(this))
          )
        )
      )
      /* jshint ignore:end */
    );
  }
});
},{"./panel_item.jsx":5}],5:[function(require,module,exports){
/** @jsx React.DOM */        // // Just links for now
        // var a = $('<a />')
        //   .attr('href', content.url)
        //   .text(content.name)
        //   .addClass('list-group-item');

        // if (content.badge) {
        //   a.append($('<span class="badge" />').text(content.badge));
        // }

        // group.append(a);

module.exports = React.createClass({displayName: 'exports',
  render: function() {
    var badgeEl = false;
    if (this.props.badge) {
      badgeEl = React.DOM.span({className: "badge"}, this.props.badge)
    }

    return (
      React.DOM.a({href: this.props.url, className: "list-group-item"}, 
        this.props.name, 
        badgeEl
      )
    );
  }
});


},{}],6:[function(require,module,exports){
/** @jsx React.DOM */var Panel = require('./panel.jsx');

module.exports = React.createClass({displayName: 'exports',
  /**
   * Explicitly set all panel heights to the same value for conformity
   * TODO: Set by row?
  **/
  componentDidUpdate: function () {
    var $node = $(this.getDOMNode());
    var maxHeight = Math.max.apply(null, $node.find('li').map(function() { return $(this).height(); }))
    $node.find('li').height(maxHeight);
  },

  render: function() {
    return (
      /* jshint ignore:start */
      React.DOM.div({className: "container"}, 
        React.DOM.ul({id: "draggablePanelList", className: "list-unstyled"}, 
          this.props.panels.map(function(panel, i) {
            return Panel(panel);
          }.bind(this))
        )
      )
      /* jshint ignore:end */
    );
  }
});

},{"./panel.jsx":4}]},{},[1])