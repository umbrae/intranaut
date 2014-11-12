module.exports = React.createClass({
  getInitialState: function() {
    return {
      status: false
    }
  },

  handleSubmit: function(e) {
    this.props.updateDataURL(this.refs.data_url.getDOMNode().value, true);
    this.setState({
      status: "Saved."
    });
  }, 

  handleDataURLChange: function(e) {
    this.props.updateDataURL(this.refs.data_url.getDOMNode().value, false);
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
            <input value={this.props.dataURL} onChange={this.handleDataURLChange} id="data_url" type="url" ref="data_url" className="form-control input-lg" size="80" placeholder="e.g. https://gist.github.com/..." />
            <p className="help-block"><a href="#">A sample version of an Intranaut configuration can be found here</a>.</p>
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

