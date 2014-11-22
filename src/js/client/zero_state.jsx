var React = require('react/addons')
var Store = require('./store.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      status: false,
      currentDataURL: this.props.dataURL
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentDataURL: nextProps.dataURL
    })
  },

  handleSubmit: function(e) {
    e.preventDefault();
    Store.emit('dataURLChange', this.refs.data_url.getDOMNode().value)
    this.setState({
      status: "Saved."
    });
  }, 

  handleDataURLChange: function(e) {
    this.setState({
      'currentDataURL': this.refs.data_url.getDOMNode().value
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
            <input value={this.state.currentDataURL} onChange={this.handleDataURLChange} id="data_url" type="url" ref="data_url" className="form-control input-lg" size="80" placeholder="e.g. https://gist.github.com/..." />
            <p className="help-block"><a href="https://gist.github.com/umbrae/0c15bf10861e21657ac0">A sample version of an Intranaut configuration can be found here</a>.</p>
          </div>

          <div className="form-group">
            <label><input type="checkbox" onChange={this.toggleCustomPanel} /> Create a Custom Panel of Links I Specify</label>

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

