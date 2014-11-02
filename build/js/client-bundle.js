(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */var Intranaut = require('./client/intranaut.jsx');

var root = document.getElementById('intranaut');
var isOptions = root.dataset.options;

/* jshint ignore:start */
React.renderComponent(Intranaut({isOptions: isOptions}), root);
/* jshint ignore:end */

},{"./client/intranaut.jsx":2}],2:[function(require,module,exports){
/** @jsx React.DOM */var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      firstRun: false,
      config: {
        header: false,
        search: false,
        panels: []
      }
    };
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    chrome.storage.local.get({
      'config_last_fetch': null,
      'config': null,
      'panel_order': null
    }, function(items) {
      var config;
      var state = {};
      var lastFetch = items.config_last_fetch;

      if (items.config) {
        try {
          config = JSON.parse(items.config);
        } catch(e) {
          lastFetch = null;
          config = null;
        }
      }

      if (lastFetch && config && this.isMounted()) {
        state['config'] = config;
      }

      this.setState(state);
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
      if (!items.data_url) {
        this.setState({
          firstRun: true
        });
        return;
      } else {
        this.setState({
          firstRun: false
        });
      }

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
          this.setState({
            config: config
          });
        }
      }.bind(this));
    }.bind(this));
  },

  updateDataURL: function(dataURL) {
    chrome.storage.sync.set({data_url: dataURL}, function() {
      this.syncConfig(true);
    }.bind(this))
  },

  render: function() {
    if (this.props.isOptions || this.state.firstRun) {
      return ZeroState({updateDataURL: this.updateDataURL});
    }

    return (
      React.DOM.div(null, 
        NavBar({
          header: this.state.config.header, 
          search: this.state.config.search}), 
        PanelList({
          panels: this.state.config.panels})
      )
    );
  }
});

},{"./nav_bar.jsx":3,"./panel_list.jsx":6,"./zero_state.jsx":7}],3:[function(require,module,exports){
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

  dragStart: function(e) {
    this.props.setDragging(e.target);
  },

  dragEnd: function(e) {
    this.props.setDragging(null);
  },

  drop: function(e) {
    var srcId = this.props.dragging.id;
    var destId = e.currentTarget.id;

    this.props.swapPanelOrder(srcId, destId);
    e.target.classList.remove('over');
  },

  dragOver: function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  },

  dragEnter: function(e) {
    e.target.classList.add('over');
  },

  dragLeave: function(e) {
    e.target.classList.remove('over');
  },

  render: function() {
    return (
      /* jshint ignore:start */
      React.DOM.li({className: "col-md-4", draggable: "true", onDragStart: this.dragStart, onDragEnd: this.dragEnd, onDragOver: this.dragOver, onDragEnter: this.dragEnter, onDragLeave: this.dragLeave, onDrop: this.drop, id: this.props.id}, 
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
  getInitialState: function() {
    return {
      dragging: null,
      panel_order: null
    };
  },

  componentDidMount: function () {
    chrome.storage.local.get('panel_order', function(items) {
      if (items.panel_order && this.isMounted()) {
        this.setState({
          panel_order: JSON.parse(items.panel_order)
        });
      }
    }.bind(this));  
  },

  /**
   * Explicitly set all panel heights to the same value for conformity
   * TODO: Set by row? set as state?
  **/
  componentDidUpdate: function () {
    var $node = $(this.getDOMNode());
    var maxHeight = Math.max.apply(null, $node.find('li').map(function() { return $(this).height(); }))
    $node.find('li').height(maxHeight);
  },

  setDragging: function(el) {
    this.setState({
      dragging: el
    });
  },

  setOrder: function(panel_order) {
    this.setState({
      panel_order: panel_order
    });
    chrome.storage.local.set({
      panel_order: JSON.stringify(panel_order)
    });
  },

  swapPanelOrder: function(srcId, destId) {
    var panel_order = this.state.panel_order;
    if (!panel_order) {
      panel_order = _.pluck(this.props.panels, 'id');
    }

    var srcIndex = _.indexOf(panel_order, srcId);
    var destIndex = _.indexOf(panel_order, destId);

    if (srcIndex === -1) {
      console.log("Unable to locate srcIndex in panel order for " + srcId);
      return;
    }

    if (destIndex === -1) {
      console.log("Unable to locate destIndex in panel order for " + destId);
      return;
    }

    tmp = panel_order[srcIndex];
    panel_order[srcIndex] = panel_order[destIndex];
    panel_order[destIndex] = tmp;

    this.setOrder(panel_order);
  },

  getSortedPanels: function() {
    var indexedPanels = _.indexBy(this.props.panels, 'id');
    var sortedPanels = [];

    if (this.state.panel_order) {
      _.each(this.state.panel_order, function(panel_id) {
        if (_.has(indexedPanels, panel_id)) {
          sortedPanels.push(indexedPanels[panel_id]);
          delete indexedPanels[panel_id]
        }
      });
      sortedPanels.push.apply(sortedPanels, _.values(indexedPanels));
    } else {
      sortedPanels = _.values(indexedPanels);
    }

    return sortedPanels;
  },

  render: function() {
    return (
      /* jshint ignore:start */
      React.DOM.div({className: "container"}, 
        React.DOM.ul({id: "draggablePanelList", className: "list-unstyled"}, 
          this.getSortedPanels().map(function(panel, i) {
            panel.swapPanelOrder = this.swapPanelOrder;
            panel.setDragging = this.setDragging;
            panel.dragging = this.state.dragging;
            return Panel(panel);
          }.bind(this))
        )
      )
      /* jshint ignore:end */
    );
  }
});

},{"./panel.jsx":4}],7:[function(require,module,exports){
/** @jsx React.DOM */module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      status: false
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.updateDataURL(this.refs.data_url.getDOMNode().value);
    this.setState({
      status: "Saved."
    });
  }, 

  render: function() {
    var formStatus;
    if (this.state.status) {
      formStatus = React.DOM.div({className: "alert alert-success"}, this.state.status)
    }

    return (
      React.DOM.section({className: "zeroState col-md-8 col-md-push-2 text-center"}, 
        React.DOM.header(null, 
          React.DOM.h1(null, "Intranaut")
        ), 
        React.DOM.hr(null), 
        React.DOM.form({role: "form", className: "welcomeForm", onSubmit: this.handleSubmit}, 
          React.DOM.div({className: "form-group"}, 
            React.DOM.label({htmlFor: "data_url"}, "Please enter the configuration URL provided by your sysadmin or manager."), 
            React.DOM.input({id: "data_url", type: "url", ref: "data_url", className: "form-control input-lg", size: "80", placeholder: "e.g. https://gist.github.com/..."}), 
            React.DOM.p({className: "help-block"}, React.DOM.a({href: "#"}, "A sample version of an Intranaut configuration can be found here"), ".")
          ), 

          React.DOM.p(null, 
            React.DOM.button({type: "submit", className: "btn btn-primary btn-lg"}, "Initialize")
          ), 

          formStatus
        )
      )
    );
  }
});


},{}]},{},[1])