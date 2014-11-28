var React = require('react/addons')
var DataURLStore = require('./stores/dataurl.jsx');
var ConfigStore = require('./stores/config.jsx');

module.exports = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      status: false,
      currentDataURL: DataURLStore.getDataURL()
    }
  },

  _onDataURLChange: function() {
    this.setState({
      currentDataURL: DataURLStore.getDataURL()
    });
  },

  componentDidMount: function () {
    DataURLStore.addChangeListener(this._onDataURLChange);
  },

  handleSubmit: function(e) {
    e.preventDefault();

    DataURLStore.setDataURL(this.state.currentDataURL);
    ConfigStore.loadFromDataURL();

    this.setState({
      status: "Saved."
    });
  }, 

  render: function() {
    var formStatus;
    if (this.state.status) {
      formStatus = <div className="alert alert-success">{this.state.status}</div>
    }

    return (
      <section className="zeroState col-md-8 col-md-push-2 text-center">
        <header>
          <h1>Intranaut</h1>
        </header>
        <hr />
        <form role="form" className="welcomeForm" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="data_url">Please enter the configuration URL provided by your sysadmin or manager.</label>
            <input type="url" valueLink={this.linkState('currentDataURL')} className="form-control input-lg" size="80" placeholder="e.g. https://gist.github.com/..." />
            <p className="help-block"><a href="https://gist.github.com/umbrae/0c15bf10861e21657ac0">A sample version of an Intranaut configuration can be found here</a>.</p>
          </div>

          <p>
            <button type="submit" className="btn btn-primary btn-lg">Initialize</button>
          </p>

          {formStatus}
        </form>
      </section>
    );
  }
});

