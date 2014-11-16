(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":2,"es5-ext/object/valid-callable":11}],2:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":3,"es5-ext/object/is-callable":6,"es5-ext/object/normalize-options":10,"es5-ext/string/#/contains":13}],3:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":4,"./shim":5}],4:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],5:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":7,"../valid-value":12}],6:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],7:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":8,"./shim":9}],8:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],9:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],10:[function(require,module,exports){
'use strict';

var assign = require('./assign')

  , forEach = Array.prototype.forEach
  , create = Object.create, getPrototypeOf = Object.getPrototypeOf

  , process;

process = function (src, obj) {
	var proto = getPrototypeOf(src);
	return assign(proto ? process(proto, obj) : obj, src);
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{"./assign":3}],11:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":14,"./shim":15}],14:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],15:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],16:[function(require,module,exports){
/** @jsx React.DOM */var Intranaut = require('./client/intranaut.jsx');

var root = document.getElementById('intranaut');
var isOptions = root.dataset.options;

/* jshint ignore:start */
React.renderComponent(Intranaut({isOptions: isOptions}), root);
/* jshint ignore:end */

},{"./client/intranaut.jsx":17}],17:[function(require,module,exports){
/** @jsx React.DOM */var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Store = require('./store.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      dataURL: null,
      firstRun: false,
      config: {
        header: false,
        search: false,
        panels: []
      },
      configLastFetch: null,
      panelOrder: null
    };
  },

  addListeners: function() {
    Store.on('storageLoaded', function(items) {
      var config;
      var state = {
        firstRun: !items.dataURL,
        dataURL: items.dataURL,
        configLastFetch: items.configLastFetch
      };

      if (items.config) {
        try {
          config = JSON.parse(items.config);
          state['config'] = config;
        } catch(e) {
          state.configLastFetch = null;
          config = null;
        }
      }

      if (items.panelOrder) {
        state['panelOrder'] = JSON.parse(items.panelOrder);
      }

      this.setState(state);

      if (!config || (now() - state.configLastFetch) > REFRESH_TIME) {
        this.syncConfig();
      }
    }.bind(this));

    Store.on('panelReorder', function(newPanelOrder) {
      this.setState({
        panelOrder: newPanelOrder
      });
      chrome.storage.local.set({
        panelOrder: JSON.stringify(newPanelOrder)
      });
    }.bind(this))

    Store.on('dataURLChange', function(dataURL) {
      this.setState({
        dataURL: dataURL,
        firstRun: !dataURL,
        configLastFetch: null
      });
      chrome.storage.sync.set({
        dataURL: dataURL
      });
      chrome.storage.local.set({
        configLastFetch: null
      });

      // Reload our data, which will fetch the new data URL
      this.loadFromStorage();
    }.bind(this))

    Store.on('configChange', function(newConfig) {
      chrome.storage.local.set({
        'configLastFetch': now(),
        'config': JSON.stringify(newConfig)
      });

      this.setState({
        configLastFetch: now(),
        config: newConfig
      });
    }.bind(this));
  },

  loadFromStorage: function () {
    chrome.storage.sync.get({
      'dataURL': null
    }, function(sync_items) {
      chrome.storage.local.get({
        'configLastFetch': null,
        'config': null,
        'panelOrder': null
      }, function(local_items) {
        Store.emit('storageLoaded', _.defaults(sync_items, local_items));
      });
    });
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    this.addListeners();
    this.loadFromStorage();
  },

  /**
   * Synchronize the config from the remote store to local storage.
   * @param renderAfterSync bool - if true, run renderConfig after loading.
  **/
  syncConfig: function(renderAfterSync) {
    if (!this.state.dataURL) {
      return;
    }

    $.get(this.state.dataURL, function(response) {
      try {
        var config = JSON.parse(response);
      } catch(e) {
        alert("Unable to load config. There may be a problem with your configuration file? " +
              "Please check your options and contact your sysadmin.");
        return;
      }

      Store.emit('configChange', config);
    }.bind(this));
  },

  render: function() {

    if (this.props.isOptions || this.state.firstRun) {
      return ZeroState({dataURL: this.state.dataURL});
    }

    return (
      React.DOM.div(null, 
        NavBar({
          header: this.state.config.header, 
          search: this.state.config.search}), 
        PanelList({
          panels: this.state.config.panels, 
          panelOrder: this.state.panelOrder})
      )
    );
  }
});

},{"./nav_bar.jsx":18,"./panel_list.jsx":21,"./store.jsx":22,"./zero_state.jsx":23}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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
              panelItem.key = panelItem.name;
              return PanelItem(panelItem);
            }.bind(this))
          )
        )
      )
      /* jshint ignore:end */
    );
  }
});
},{"./panel_item.jsx":20}],20:[function(require,module,exports){
/** @jsx React.DOM */module.exports = React.createClass({displayName: 'exports',
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


},{}],21:[function(require,module,exports){
/** @jsx React.DOM */var Panel = require('./panel.jsx');
var Store = require('./store.jsx');

module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      dragging: null
    };
  },

  /**
   * Explicitly set all panel heights in a row to the same value for conformity
  **/
  componentDidUpdate: function () {
    var panelsByRow = _.groupBy($('li', this.getDOMNode()), function(el) {
      return $(el).position().top;
    });

    _.each(panelsByRow, function(panels) {
      var maxHeight = _.max(_.map(panels, function(el) { return $(el).height() }));
      $(panels).height(maxHeight);
    });
  },

  setDragging: function(el) {
    this.setState({
      dragging: el
    });
  },

  swapPanelOrder: function(srcId, destId) {
    var panelOrder = this.props.panelOrder;
    if (!panelOrder) {
      panelOrder = _.pluck(this.props.panels, 'id');
    }

    var srcIndex = _.indexOf(panelOrder, srcId);
    var destIndex = _.indexOf(panelOrder, destId);

    if (srcIndex === -1) {
      console.log("Unable to locate srcIndex in panel order for " + srcId);
      return;
    }

    if (destIndex === -1) {
      console.log("Unable to locate destIndex in panel order for " + destId);
      return;
    }

    tmp = panelOrder[srcIndex];
    panelOrder[srcIndex] = panelOrder[destIndex];
    panelOrder[destIndex] = tmp;

    Store.emit('panelReorder', panelOrder);
  },

  getSortedPanels: function() {
    var indexedPanels = _.indexBy(this.props.panels, 'id');
    var sortedPanels = [];

    if (this.props.panelOrder) {
      _.each(this.props.panelOrder, function(panelId) {
        if (_.has(indexedPanels, panelId)) {
          sortedPanels.push(indexedPanels[panelId]);
          delete indexedPanels[panelId]
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
            panel.key = panel.id;
            return Panel(panel);
          }.bind(this))
        )
      )
      /* jshint ignore:end */
    );
  }
});

},{"./panel.jsx":19,"./store.jsx":22}],22:[function(require,module,exports){
/** @jsx React.DOM */var ee = require('event-emitter');

var Store = ee({});

module.exports = Store;
},{"event-emitter":1}],23:[function(require,module,exports){
/** @jsx React.DOM */var Store = require('./store.jsx');

module.exports = React.createClass({displayName: 'exports',
  getInitialState: function() {
    return {
      status: false,
      currentDataURL: this.props.dataURL
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentDataURL: nextProps.dataURL
    })
  },

  handleSubmit: function(e) {
    e.preventDefault();
    Store.emit('dataURLChange', this.refs.data_url.getDOMNode().value)
    this.setState({
      status: "Saved."
    });
  }, 

  handleDataURLChange: function(e) {
    this.setState({
      'currentDataURL': this.refs.data_url.getDOMNode().value
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
            React.DOM.input({value: this.state.currentDataURL, onChange: this.handleDataURLChange, id: "data_url", type: "url", ref: "data_url", className: "form-control input-lg", size: "80", placeholder: "e.g. https://gist.github.com/..."}), 
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


},{"./store.jsx":22}]},{},[16])