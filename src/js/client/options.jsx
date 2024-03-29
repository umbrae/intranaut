var _ = require('underscore');
var $ = require('jquery');

var React = require('react');
var DataURLStore = require('./stores/dataurl.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');

function getUserOptionsState() {
  return {
    hiddenPanels: UserOptionsStore.getHiddenPanels(),
    customLinks: UserOptionsStore.getCustomLinks()
  };
}

// Todo: All these classes seem to rely on the same state. Should they be merged? Subclass?
var CustomLinks = React.createClass({
  getInitialState: function() {
    return {
      name: "",
      customLinks: UserOptionsStore.getCustomLinks()
    }
  },

  _onUserOptionsChange: function() {
    if (this.isMounted()) {
      this.setState(getUserOptionsState());
    }
  },

  componentDidMount: function () {
    UserOptionsStore.addChangeListener(this._onUserOptionsChange);
  },

  handleLinkUpdate: function(e) {
    var newLinks = [];

    // Ghetto grouping of related inputs.
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
    linkInputs = this.state.customLinks.map(function(link, i) {
      return this._linkFragment(link.name, link.url, i);
    }.bind(this));
    linkInputs.push(this._linkFragment("", "", linkInputs.length));

    return (
      <div className="form-group row">
        <div className="col-md-3">
          <strong>Custom Links</strong>
          <small className="help-block">Custom Links will show up under a special panel on your new tab for use just like a regular panel, but will be just for you.</small>
        </div>
        <div className="col-md-9">
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
        </div>
      </div>
    );
  }
})

var HiddenPanels = React.createClass({
  getInitialState: function() {
    return {
      panels: ConfigStore.getConfig().panels,
      hiddenPanels: UserOptionsStore.getHiddenPanels()
    }
  },

  _onConfigChange: function() {
    if (this.isMounted()) {
      this.setState({
        panels: ConfigStore.getConfig().panels
      });
    }
  },

  _onUserOptionsChange: function() {
    if (this.isMounted()) {
      this.setState(getUserOptionsState());
    }
  },

  componentDidMount: function() {
    ConfigStore.addChangeListener(this._onConfigChange);
    UserOptionsStore.addChangeListener(this._onUserOptionsChange);
  },

  handleUpdateHiddenPanels: function(e) {
    var hiddenPanels = _.map(_.filter(this.refs, function(node) {
      return node.getDOMNode().checked;
    }), function(node) {
      return node.getDOMNode().value;
    })

    UserOptionsStore.setHiddenPanels(hiddenPanels);
  },

  render: function() {
    return (
      <div className="form-group row hiddenPanels">
        <div className="col-md-3">
          <strong>Hidden Panels</strong>
          <small className="help-block">Panels marked as hidden will never be shown to you.</small>
        </div>
        <div className="col-md-9">
          <table className="table table-striped">
            <thead>
              <tr className="form-group row">
                <th className="col-md-4">Panel</th>
                <th className="col-md-8">Hidden</th>
              </tr>
            </thead>
            <tbody>
              {this.state.panels.map(function(panel, i) {
                if (_.contains(this.state.hiddenPanels, panel.id)) {
                  return <tr className="form-group row" key={i}>
                    <td className="col-md-4"><label htmlFor={panel.id}><s>{panel.name}</s></label></td>
                    <td className="col-md-8"><input type="checkbox" id={panel.id} ref={panel.id} value={panel.id} checked="checked" onChange={this.handleUpdateHiddenPanels} /></td>
                  </tr>
                } else {
                  return <tr className="form-group row" key={i}>
                    <td className="col-md-4"><label htmlFor={panel.id}>{panel.name}</label></td>
                    <td className="col-md-8"><input type="checkbox" id={panel.id} ref={panel.id} value={panel.id} onChange={this.handleUpdateHiddenPanels} /></td>
                  </tr>
                }
              }.bind(this))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
})

module.exports = React.createClass({
  getInitialState: function() {
    return {
      status: false,
      currentDataURL: DataURLStore.getDataURL(),
      customPanelName: "",
      customLinks: UserOptionsStore.getCustomLinks()
    }
  },

  _onDataURLChange: function() {
    if (this.isMounted()) {
      this.setState({
        currentDataURL: DataURLStore.getDataURL()
      });
    }
  },

  componentDidMount: function () {
    DataURLStore.addChangeListener(this._onDataURLChange);

    if (this.props.showByDefault) {
      $('#options-modal').modal('show');
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    DataURLStore.setDataURL(this.state.currentDataURL);
  },

  handleCurrentDataURLChange: function(e) {
    this.setState({
      currentDataURL: e.target.value
    })
  },

  render: function() {

    return (
      <div className="modal fade" id="options-modal" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <header className="modal-header">
              <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>              
              <a href="tab.html"><h1>Intranaut</h1></a>
            </header>
            <form role="form" className="optionsForm modal-body" onSubmit={this.handleSubmit}>
              <div className="form-group row">
                <div className="col-md-3">
                  <strong>Configuration URL</strong>
                  <small className="help-block">The configuration URL provided by your sysadmin or manager. <a href="https://gist.github.com/umbrae/0c15bf10861e21657ac0">A sample version of an Intranaut configuration can be found here</a>.</small>
                </div>
                <div className="col-md-9">
                  <div className="input-group">
                    <input type="url" value={this.state.currentDataURL} onChange={this.handleCurrentDataURLChange} className="form-control" size="80" placeholder="e.g. https://gist.github.com/..." />
                    <span className="input-group-btn">
                      <button className="btn btn-primary" type="button" onClick={this.handleSubmit}>Load</button>
                    </span>
                  </div>
                </div>
              </div>

              <hr />

              <CustomLinks />

              <hr />

              <HiddenPanels />
            </form>
            <div className="modal-footer">
              <p className="text-center">
                <button type="button" data-dismiss="modal" className="btn btn-primary btn-lg">Save and Close</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

