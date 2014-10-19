        // // Just links for now
        // var a = $('<a />')
        //   .attr('href', content.url)
        //   .text(content.name)
        //   .addClass('list-group-item');

        // if (content.badge) {
        //   a.append($('<span class="badge" />').text(content.badge));
        // }

        // group.append(a);

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

