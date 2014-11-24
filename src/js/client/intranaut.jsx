var React = require('react/addons')
var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Options = require('./options.jsx');

var Store = require('./store.jsx');

var ConfigStore = require('./stores/config.jsx');
var DataURLStore = require('./stores/dataurl.jsx');

var REFRESH_TIME = 600;

function getDataURLState() {
  return DataURLStore.getDataURL();
}

function getConfigState() {
  return ConfigStore.getConfig();
}

function getConfigLastFetchState() {
  return ConfigStore.getLastFetch();
}

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}



module.exports = React.createClass({
  getInitialState: function() {
    return {
      dataURL: getDataURLState(),
      firstRun: false,
      config: getConfigState(),
      configLastFetch: getConfigLastFetchState(),
      panelOrder: null,
      customLinks: []
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

      if (items.customLinks) {
        state['customLinks'] = JSON.parse(items.customLinks);
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

    Store.on('customLinksChange', function(customLinks) {
      this.setState({
        customLinks: customLinks
      })
      chrome.storage.local.set({
        customLinks: JSON.stringify(customLinks)
      });
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
        'panelOrder': null,
        'customLinks': null
      }, function(local_items) {
        Store.emit('storageLoaded', _.defaults(sync_items, local_items));
      });
    });
  },

  _onConfigChange: function() {
    this.setState({
      config: getConfigState(),
      configLastFetch: getConfigLastFetchState()
    });
  },

  _onDataURLChange: function() {
    this.setState({
      dataURL: getDataURLState()
    });
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    ConfigStore.addChangeListener(this._onConfigChange);
    DataURLStore.addChangeListener(this._onDataURLChange);

    DataURLStore.loadFromStorage();

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

  getPanels: function() {
    if (_.isEmpty(this.state.customLinks)) {
      return this.state.config.panels;
    }

    return this.state.config.panels.concat([{
      "id": "custom2",
      "key": "custom2",
      "name": "Links2",
      "contents": this.state.customLinks
    }])
  },

  render: function() {

    if (this.props.isOptions) {
      return <Options dataURL={this.state.dataURL} customLinks={this.state.customLinks} />;
    }

    if (this.props.isOptions || this.state.firstRun) {
      return <ZeroState dataURL={this.state.dataURL} />;
    }

    var panels = this.getPanels();
    console.log(panels);

    return (
      <div>
        <NavBar
          header={this.state.config.header}
          search={this.state.config.search} />
        <PanelList
          panels={this.state.config.panels}
          panelOrder={this.state.panelOrder} />
      </div>
    );
  }
});
