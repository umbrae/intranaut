var React = require('react/addons')

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
      header: {
        name: "intranaut",
        logo: false,
        url: false
      },
      search: false
    }
  },

  render: function() {
    var logoEl;
    var searchEl;

    if (this.props.header.logo) {
      logoEl = <img src={this.props.header.logo} className="logo" />
    } else {
      logoEl = false;
    }

    if (this.props.search) {
      searchEl = (
        <form id="search" className="navbar-form navbar-right" role="form" method="get" action={this.props.search.url}>
          <div className="input-group">
            <input type="text" id="searchString" name={this.props.search.searchParam} className="form-control" placeholder={this.props.search.placeholder} />
            <span className="input-group-btn">
              <button className="btn btn-primary" type="submit">{this.props.search.button_title}</button>
            </span>
          </div>
        </form>
      )
    } else {
      searchEl = false;
    }

    return (
      /* jshint ignore:start */
      <div className="navbar" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href={this.props.header.url}>
              {logoEl}
              <span className="navbar-brand-name">{this.props.header.name}</span>
            </a>
          </div>
          {searchEl}
        </div>
      </div>
      /* jshint ignore:end */
    );
  }
});
