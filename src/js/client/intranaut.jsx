var React = require('react/addons')
var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Options = require('./options.jsx');

var ConfigStore = require('./stores/config.jsx');
var DataURLStore = require('./stores/dataurl.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');

function getDataURLState() {
  return {
    dataURL: DataURLStore.getDataURL()
  };
}

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

module.exports = React.createClass({
  getInitialState: function() {
    return _.extend({}, getDataURLState(), getConfigState(), getUserOptionsState());
  },

  _onConfigChange: function() {
    if (this.isMounted()) {
      this.setState(getConfigState());
    }
  },

  _onDataURLChange: function() {
    if (!this.isMounted()) {
      return;
    }

    var newState = getDataURLState();

    // If we've updated our dataURL from one url to another, refresh our config.
    // Todo: This feels a little bit like the wrong place. Should it be in ConfigStore?
    if (this.state.dataURL && this.state.dataURL != newState.dataURL) {
      ConfigStore.loadFromDataURL();
    }

    this.setState(newState);
  },

  _onUserOptionsChange: function() {
    if (this.isMounted()) {
      this.setState(getUserOptionsState());
    }
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
  },

  render: function() {
    var firstRun = this.state.configLoaded && (!this.state.dataURL || _.isEmpty(this.state.config.panels));

    if (firstRun) {
      return <ZeroState />;
    }

    return (
      <div>
        <Options showByDefault={this.props.isOptions} />
        <NavBar
          header={this.state.config.header}
          search={this.state.config.search} />
        <PanelList />
        <a className="configLink" aria-label="Configuration" data-toggle="modal" data-target="#options-modal"><span className="glyphicon glyphicon-cog"></span></a>  
      </div>
    );
  }
});
