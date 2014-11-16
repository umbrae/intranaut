var Panel = require('./panel.jsx');
var Store = require('./store.jsx');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      dragging: null,
      panel_order: null
    };
  },

  componentDidMount: function () {
    chrome.storage.local.get('panel_order', function(items) {
      if (items.panel_order && this.isMounted()) {
        this.setState({
          panel_order: JSON.parse(items.panel_order)
        });
      }
    }.bind(this));  
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

  setOrder: function(panel_order) {
    this.setState({
      panel_order: panel_order
    });
    chrome.storage.local.set({
      panel_order: JSON.stringify(panel_order)
    });
  },

  swapPanelOrder: function(srcId, destId) {
    var panel_order = this.state.panel_order;
    if (!panel_order) {
      panel_order = _.pluck(this.props.panels, 'id');
    }

    var srcIndex = _.indexOf(panel_order, srcId);
    var destIndex = _.indexOf(panel_order, destId);

    if (srcIndex === -1) {
      console.log("Unable to locate srcIndex in panel order for " + srcId);
      return;
    }

    if (destIndex === -1) {
      console.log("Unable to locate destIndex in panel order for " + destId);
      return;
    }

    tmp = panel_order[srcIndex];
    panel_order[srcIndex] = panel_order[destIndex];
    panel_order[destIndex] = tmp;

    Store.emit('reorder-panels', panel_order);

    this.setOrder(panel_order);
  },

  getSortedPanels: function() {
    var indexedPanels = _.indexBy(this.props.panels, 'id');
    var sortedPanels = [];

    if (this.state.panel_order) {
      _.each(this.state.panel_order, function(panel_id) {
        if (_.has(indexedPanels, panel_id)) {
          sortedPanels.push(indexedPanels[panel_id]);
          delete indexedPanels[panel_id]
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
