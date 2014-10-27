var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({
  getInitialState: function() {
    return {
      config: {
        header: false,
        search: false,
        panels: []
      },
      panel_order: null
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

      if (items.panel_order) {
        state['panel_order'] = JSON.parse(items.panel_order);
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

  render: function() {
    return (
      /* jshint ignore:start */
      <div>
        <NavBar
          header={this.state.config.header}
          search={this.state.config.search} />
        <PanelList
          panels={this.state.config.panels} />
      </div>
      /* jshint ignore:end */
    );
  }
});
