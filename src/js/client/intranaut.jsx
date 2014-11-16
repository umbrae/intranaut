var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Store = require('./store.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({
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
      return <ZeroState dataURL={this.state.dataURL} />;
    }

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
