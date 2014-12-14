var _ = require('underscore');

var React = require('react')

module.exports = React.createClass({
  render: function() {
    var badgeEl = false;
    if (this.props.badge) {
      badgeEl = <span className="badge">{this.props.badge}</span>
    }

    return (
      <a href={this.props.url} className="list-group-item">
        {this.props.name}
        {badgeEl}
      </a>
    );
  }
});

