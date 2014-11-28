var React = require('react/addons');
var Store = require('./store.jsx');
var DataURLStore = require('./stores/dataurl.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');

function getUserOptionsState() {
  return {
    "links": UserOptionsStore.getCustomLinks()
  };
}

var CustomLinks = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      name: "",
      links: UserOptionsStore.getCustomLinks()
    }
  },

  _onUserOptionsChange: function() {
    this.setState(getUserOptionsState());
  },

  /**
   * Fetch our config from localstorage, and render it. If we have no config yet,
   * fetch it first. If we have a config but it's out of date, refresh in the background.
  **/
  componentDidMount: function () {
    UserOptionsStore.addChangeListener(this._onUserOptionsChange);
  },

  handleLinkUpdate: function(e) {
    var newLinks = [];

    // Gheetttooooooo
    var i = 0;
    while (typeof this.refs[i + ":name"] !== "undefined") {
      var link = {
        "name": this.refs[i + ':name'].getDOMNode().value,
        "url": this.refs[i + ':url'].getDOMNode().value
      }

      if (link.name || link.url) {
        newLinks.push(link);
      }

      i++;
    }

    UserOptionsStore.setCustomLinks(newLinks);
  },

  _linkFragment: function(name, url, i) {
    return <tr className="form-group row" key={i}>
      <td className="col-md-4"><input type="text" ref={i + ":name"} value={name} onChange={this.handleLinkUpdate} className="form-control" placeholder="name" /></td>
      <td className="col-md-8"><input type="text" ref={i + ":url"} value={url} onChange={this.handleLinkUpdate} className="form-control" placeholder="url" /></td>
    </tr>
  },

  render: function() {
    linkInputs = this.state.links.map(function(link, i) {
      return this._linkFragment(link.name, link.url, i);
    }.bind(this));
    linkInputs.push(this._linkFragment("", "", linkInputs.length));

    return (<fieldset>
        <legend>Custom Links</legend>
        <p>Custom Links will show up under a special panel on your new tab for use just like a regular panel, but will be just for you.</p>

        <table className="table table-striped">
          <thead>
            <tr className="form-group row">
              <th className="col-md-4">Link Name</th>
              <th className="col-md-8">Link URL</th>
            </tr>
          </thead>
          <tbody>
            {linkInputs}
          </tbody>
        </table>
      </fieldset>
    );
  }
})


module.exports = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      status: false,
      currentDataURL: DataURLStore.getDataURL(),
      customPanelName: "",
      customLinks: UserOptionsStore.getCustomLinks()
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

          <CustomLinks />

          <p>
            <button type="submit" className="btn btn-primary btn-lg">Initialize</button>
          </p>

          {formStatus}
        </form>
      </section>
    );
  }
});

