var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');

var REFRESH_TIME = 600;

function now() {
  return Math.floor((new Date()).getTime() / 1000);
}

module.exports = React.createClass({
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
      <div>
        <NavBar
          header={this.state.header}
          search={this.state.search} />
        <PanelList
          panels={this.state.panels} />
      </div>
      /* jshint ignore:end */
    );
  }
});