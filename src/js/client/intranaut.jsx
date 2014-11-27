var React = require('react/addons')
var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Options = require('./options.jsx');

var Store = require('./store.jsx');

var ConfigStore = require('./stores/config.jsx');
var DataURLStore = require('./stores/dataurl.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');

window.stores = [
  ConfigStore, DataURLStore, UserOptionsStore
]

var REFRESH_TIME = 600;

function getConfigState() {
  return {
    "configLoaded": ConfigStore.hasLoaded(),
    "config": ConfigStore.getConfig(),
    "configLastFetch": ConfigStore.getLastFetch()
  };
}

function getUserOptionsState() {
  return {
    "customLinks": UserOptionsStore.getCustomLinks()
  };
}

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({
  getInitialState: function() {
    return _.extend({
      dataURL: DataURLStore.getDataURL(),
    }, getConfigState(), getUserOptionsState());
  },

  addListeners: function() {
    Store.on('storageLoaded', function(items) {
      if (!items.config || (now() - this.state.configLastFetch) > REFRESH_TIME) {
        this.syncConfig();
      }
    }.bind(this));

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
    chrome.storage.local.get({
      'configLastFetch': null,
      'config': null
    }, function(local_items) {
      Store.emit('storageLoaded', local_items);
    });
  },

  _onConfigChange: function() {
    this.setState(getConfigState());
  },

  _onDataURLChange: function() {
    this.setState({
      dataURL: DataURLStore.getDataURL()
    });
  },

  _onUserOptionsChange: function() {
    this.setState(getUserOptionsState());
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    ConfigStore.addChangeListener(this._onConfigChange);
    DataURLStore.addChangeListener(this._onDataURLChange);
    UserOptionsStore.addChangeListener(this._onUserOptionsChange);

    DataURLStore.loadFromStorage();
    ConfigStore.loadFromStorage();
    UserOptionsStore.loadFromStorage();

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
    var firstRun = this.state.configLoaded && (!this.state.dataURL || _.isEmpty(this.state.config.panels));

    if (this.props.isOptions) {
      return <Options dataURL={this.state.dataURL} customLinks={this.state.customLinks} />;
    }

    if (this.props.isOptions || firstRun) {
      return <ZeroState dataURL={this.state.dataURL} />;
    }

    var panels = this.getPanels();

    return (
      <div>
        <NavBar
          header={this.state.config.header}
          search={this.state.config.search} />
        <PanelList
          panels={this.state.config.panels} />
      </div>
    );
  }
});
