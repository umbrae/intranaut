var React = require('react/addons')
var Panel = require('./panel.jsx');
var Store = require('./store.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      dragging: null
    };
  },

  /**
   * Explicitly set all panel heights in a row to the same value for conformity
  **/
  componentDidUpdate: function () {
    var panelsByRow = _.groupBy($('li', this.getDOMNode()), function(el) {
      return $(el).position().top;
    });

    _.each(panelsByRow, function(panels) {
      var maxHeight = _.max(_.map(panels, function(el) { return $(el).height() }));
      $(panels).height(maxHeight);
    });
  },

  setDragging: function(el) {
    this.setState({
      dragging: el
    });
  },

  swapPanelOrder: function(srcId, destId) {
    var panelOrder = this.props.panelOrder;
    if (!panelOrder) {
      panelOrder = _.pluck(this.props.panels, 'id');
    }

    var srcIndex = _.indexOf(panelOrder, srcId);
    var destIndex = _.indexOf(panelOrder, destId);

    if (srcIndex === -1) {
      console.log("Unable to locate srcIndex in panel order for " + srcId);
      return;
    }

    if (destIndex === -1) {
      console.log("Unable to locate destIndex in panel order for " + destId);
      return;
    }

    tmp = panelOrder[srcIndex];
    panelOrder[srcIndex] = panelOrder[destIndex];
    panelOrder[destIndex] = tmp;

    Store.emit('panelReorder', panelOrder);
  },

  getSortedPanels: function() {
    var indexedPanels = _.indexBy(this.props.panels, 'id');
    var sortedPanels = [];

    if (this.props.panelOrder) {
      _.each(this.props.panelOrder, function(panelId) {
        if (_.has(indexedPanels, panelId)) {
          sortedPanels.push(indexedPanels[panelId]);
          delete indexedPanels[panelId]
        }
      });
      sortedPanels.push.apply(sortedPanels, _.values(indexedPanels));
    } else {
      sortedPanels = _.values(indexedPanels);
    }

    return sortedPanels;
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <div className="container">
        <ul id="draggablePanelList" className="list-unstyled">
          {this.getSortedPanels().map(function(panel, i) {
            panel.swapPanelOrder = this.swapPanelOrder;
            panel.setDragging = this.setDragging;
            panel.dragging = this.state.dragging;
            panel.key = panel.id;
            return Panel(panel);
          }.bind(this))}
        </ul>
      </div>
      /* jshint ignore:end */
    );
  }
});
