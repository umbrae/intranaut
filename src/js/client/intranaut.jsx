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
    this.setState(getConfigState());
  },

  _onDataURLChange: function() {
    var newState = getDataURLState();

    // Todo: This feels a little bit like the wrong place. Should it be in ConfigStore?
    if (this.state.dataURL && this.state.dataURL != newState.dataURL) {
      ConfigStore.loadFromDataURL();
    }

    this.setState(newState);
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
  },

  render: function() {
    var firstRun = this.state.configLoaded && (!this.state.dataURL || _.isEmpty(this.state.config.panels));

    if (this.props.isOptions) {
      return <Options dataURL={this.state.dataURL} customLinks={this.state.customLinks} />;
    }

    if (this.props.isOptions || firstRun) {
      return <ZeroState dataURL={this.state.dataURL} />;
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
