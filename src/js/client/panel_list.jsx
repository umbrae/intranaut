var Panel = require('./panel.jsx');

module.exports = React.createClass({
  /**
   * Explicitly set all panel heights to the same value for conformity
   * TODO: Set by row?
  **/
  componentDidUpdate: function () {
    var $node = $(this.getDOMNode());
    var maxHeight = Math.max.apply(null, $node.find('li').map(function() { return $(this).height(); }))
    $node.find('li').height(maxHeight);
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <div className="container">
        <ul id="draggablePanelList" className="list-unstyled">
          {this.props.panels.map(function(panel, i) {
            return Panel(panel);
          }.bind(this))}
        </ul>
      </div>
      /* jshint ignore:end */
    );
  }
});
