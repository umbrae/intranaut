var PanelItem = require('./panel_item.jsx');

module.exports = React.createClass({

  dragStart: function(e) {
    this.props.setDragging(e.target);
  },

  dragEnd: function(e) {
    this.props.setDragging(null);
  },

  drop: function(e) {
    var srcId = this.props.dragging.id;
    var destId = e.currentTarget.id;

    this.props.swapPanelOrder(srcId, destId);
    e.target.classList.remove('over');
  },

  dragOver: function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  },

  dragEnter: function(e) {
    e.target.classList.add('over');
  },

  dragLeave: function(e) {
    e.target.classList.remove('over');
  },

  render: function() {
    return (
      /* jshint ignore:start */
      <li className="col-md-4" draggable="true" onDragStart={this.dragStart} onDragEnd={this.dragEnd} onDragOver={this.dragOver} onDragEnter={this.dragEnter} onDragLeave={this.dragLeave} onDrop={this.drop} id={this.props.id}>
        <div className="panel panel-success">
          <div className="panel-heading">
            <span className="panel-name">{this.props.name}</span>
            <span className="pull-right glyphicon glyphicon-th"></span>
          </div>
          <div className="list-group">
            {this.props.contents.map(function(panelItem, i) {
              panelItem.key = panelItem.name;
              return PanelItem(panelItem);
            }.bind(this))}
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );
  }
});