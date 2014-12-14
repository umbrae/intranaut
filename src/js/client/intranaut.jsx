var _ = require('underscore');

var React = require('react');
var NavBar = require('./nav_bar.jsx');
var PanelList = require('./panel_list.jsx');
var ZeroState = require('./zero_state.jsx');
var Options = require('./options.jsx');
var Styles = require('./styles.jsx');

var ConfigStore = require('./stores/config.jsx');
var DataURLStore = require('./stores/dataurl.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');
var StylesStore = require('./stores/style.jsx');

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

function getRenderReadyState() {
  return {
    "renderReady": StylesStore.hasLoaded() && ConfigStore.hasLoaded()
  };
}

module.exports = React.createClass({
  getInitialState: function() {
    return _.extend({}, getDataURLState(), getConfigState(), getUserOptionsState(), getRenderReadyState());
  },

  _onConfigChange: function() {
    if (this.isMounted()) {
      this.setState(_.extend({}, getConfigState(), getRenderReadyState()));
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

  _onStyleChange: function() {
    if (this.isMounted()) {
      this.setState(getRenderReadyState());
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
    StylesStore.addChangeListener(this._onStyleChange);

    DataURLStore.loadFromStorage();
    ConfigStore.loadFromStorage();
    StylesStore.loadFromStorage();
    UserOptionsStore.loadFromStorage();
  },

  render: function() {
    var firstRun = this.state.configLoaded && (!this.state.dataURL || _.isEmpty(this.state.config.panels));

    if (!this.state.renderReady) {
      return <div />;
    }

    if (firstRun) {
      return <ZeroState />;
    }

    return (
      <div>
        <Styles />
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
