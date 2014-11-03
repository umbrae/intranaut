var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({
  getInitialState: function() {
    return {
      firstRun: false,
      dataURL: null,
      config: {
        header: false,
        search: false,
        panels: []
      },
      configLastFetch: null,
      panelOrder: []
    };
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  loadState: function () {
    // todo promisify
    chrome.storage.sync.get({
      'dataURL': false
    }, function(syncItems) {

      chrome.storage.local.get({
        'config_last_fetch': null,
        'config': null,
        'panel_order': null
      }, function(localItems) {
        var state = {
          dataURL: syncItems.dataURL,
          firstRun: !syncItems.dataURL,
          configLastFetch: localItems.configLastFetch
        }

        if (localItems.config) {
          state['config'] = JSON.parse(localItems.config);
        }

        if (localItems.panel_order) {
          state['panel_order'] = JSON.parse(localItems.panel_order);
        }

        this.setState(state);

        var configIsStale = !state.configLastFetch || (now() - state.configLastFetch) > REFRESH_TIME;
        if (this.state.dataURL && configIsStale) {
          this.syncConfig();
        }
      }.bind(this))
    }.bind(this));
  },

  storeState: function () {
    chrome.storage.sync.set({
      'dataURL': this.state.dataURL
    });

    chrome.storage.local.set({
      'config_last_fetch': this.state.configLastFetch,
      'config': JSON.stringify(this.state.config),
      'panel_order': JSON.stringify(this.state.panelOrder)
    });
  },

  componentDidMount: function () {
    this.loadState();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.storeState();

    if (this.state.dataURL && prevState.dataURL !== this.state.dataURL) {
      this.syncConfig();
    }
  },

  /**
   * Synchronize the config from the remote store to local storage.
  **/
  syncConfig: function() {
    if (!this.state.dataURL) {
      console.warn("Cannot sync config: dataURL is not set.");
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

      this.setState({
        firstRun: false,
        configLastFetch: now(),
        config: config
      });
      this.render();
    }.bind(this));
  },

  updateDataURL: function(dataURL) {
    this.setState({
      dataURL: dataURL
    });
  },

  render: function() {
    if (this.props.isOptions || this.state.firstRun) {
      return <ZeroState updateDataURL={this.updateDataURL} />;
    }

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
