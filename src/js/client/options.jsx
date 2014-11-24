var React = require('react/addons');
var Store = require('./store.jsx');
var DataURLStore = require('./stores/dataurl.jsx');

var CustomLinkInput = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      name: this.props.name,
      url: this.props.url
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      name: nextProps.name,
      url: nextProps.url
    })
  },

  render: function() {
    return (
      <div className="form-group row">
        <div className="col-md-4"><input type="text" valueLink={this.linkState('name')} className="form-control" placeholder="name" /></div>
        <div className="col-md-6"><input type="text" valueLink={this.linkState('url')} className="form-control" placeholder="url" /></div>
      </div>
    );
  }
});


module.exports = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      status: false,
      currentDataURL: this.props.dataURL,
      customPanelName: "",
      customLinks: this.props.customLinks
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentDataURL: nextProps.dataURL,
      customLinks: nextProps.customLinks
    })
  },

  handleSubmit: function(e) {
    e.preventDefault();

    console.log('test');
    DataURLStore.setDataURL(this.state.currentDataURL);

//    Store.emit('dataURLChange', this.state.currentDataURL)

    var customLinkContents = []
    _.each(this.refs, function(ref, name) {
      if (name.indexOf('customLink') === 0) {
        customLinkContents.push(ref.state)
      }
    });

    Store.emit('customLinksChange', customLinkContents);

    this.setState({
      status: "Saved."
    });
  },

  render: function() {
    var formStatus;
    if (this.state.status) {
      formStatus = <div className="alert alert-success">{this.state.status}</div>
    }

    // Total hax. Rebuild this entirely when we have our new data model with non-fake Store and model.
    linkInputs = this.state.customLinks.map(function(link, i) {
      return (
        <CustomLinkInput name={link.name} url={link.url} ref={"customLink_" + i} key={i} />
      );
    });

    _.times(5 - linkInputs.length, function() {
      linkInputs.push(<CustomLinkInput name="" url="" ref={"customLink_" + linkInputs.length} key={linkInputs.length} />);
    });

    return (
      <section className="options col-md-8 col-md-push-2">
        <header>
          <h1>Intranaut</h1>
        </header>
        <hr />
        <form role="form" className="optionsForm" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="data_url">Please enter the configuration URL provided by your sysadmin or manager.</label>
            
            <input type="url" valueLink={this.linkState('currentDataURL')} className="form-control input-lg" size="80" placeholder="e.g. https://gist.github.com/..." />
            <p className="help-block"><a href="https://gist.github.com/umbrae/0c15bf10861e21657ac0">A sample version of an Intranaut configuration can be found here</a>.</p>
          </div>

          <div className="form-group">
            <h3>Custom Panel</h3>
            {linkInputs}
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

