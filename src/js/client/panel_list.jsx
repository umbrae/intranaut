var _ = require('underscore');
var $ = require('jquery');

var React = require('react')
var Panel = require('./panel.jsx');
var ConfigStore = require('./stores/config.jsx');
var UserOptionsStore = require('./stores/useroptions.jsx');

function getPanelState() {
  var panels = _.clone(ConfigStore.getConfig().panels),
    customLinks = UserOptionsStore.getCustomLinks(),
    hiddenPanels = UserOptionsStore.getHiddenPanels();

  if (customLinks && customLinks.length > 0 && (panels.length == 0 || panels[panels.length-1].id !== "intranaut-custom")) {
    panels.push({
          id: "intranaut-custom",
          name: "My Links",
          contents: customLinks
    })
  }

  panels = _.reject(panels, function(panel) {
    return _.contains(hiddenPanels, panel.id)
  });

  return {
    panels: panels,
    panelOrder: UserOptionsStore.getPanelOrder()
  };
}

module.exports = React.createClass({
  getInitialState: function() {
    return _.extend({
      dragging: null
    }, getPanelState());
  },

  _onPanelChange: function () {
    if (this.isMounted()) {
      this.setState(getPanelState());
    }
  },

  componentDidMount: function () {
    UserOptionsStore.addChangeListener(this._onPanelChange);
    ConfigStore.addChangeListener(this._onPanelChange);
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
    var panelOrder = this.state.panelOrder;
    if (!panelOrder || panelOrder.length < this.state.panels.length) {
      panelOrder = _.pluck(this.state.panels, 'id');
    }

    // If any panels have been newly loaded since we last set our panel order,
    // they will be at the end. Add them into our panelOrder before setting swap.
    var missingPanels = _.difference(_.pluck(this.state.panels, 'id'), this.state.panelOrder);
    panelOrder = panelOrder.concat(missingPanels);

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

    var tmp = panelOrder[srcIndex];
    panelOrder[srcIndex] = panelOrder[destIndex];
    panelOrder[destIndex] = tmp;

    UserOptionsStore.setPanelOrder(panelOrder);
  },

  getSortedPanels: function() {
    var indexedPanels = _.indexBy(this.state.panels, 'id');
    var sortedPanels = [];

    if (this.state.panelOrder) {
      _.each(this.state.panelOrder, function(panelId) {
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
