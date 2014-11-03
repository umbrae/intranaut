module.exports = React.createClass({
  getInitialState: function() {
    return {
      status: false
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.updateDataURL(this.refs.dataURL.getDOMNode().value);
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
            <label htmlFor="dataURL">Please enter the configuration URL provided by your sysadmin or manager.</label>
            <input id="dataURL" type="url" ref="dataURL" className="form-control input-lg" size="80" placeholder="e.g. https://gist.github.com/..." />
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

