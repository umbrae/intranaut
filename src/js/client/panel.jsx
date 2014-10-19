var PanelItem = require('./panel_item.jsx');

module.exports = React.createClass({
  render: function() {
    return (
      /* jshint ignore:start */
      <li className="col-md-4" id={this.props.id}>
        <div className="panel panel-success">
          <div className="panel-heading">
            <span className="panel-name">{this.props.name}</span>
            <span className="pull-right glyphicon glyphicon-th"></span>
          </div>
          <div className="list-group">
            {this.props.contents.map(function(panelItem, i) {
              return PanelItem(panelItem);
            }.bind(this))}
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );
  }
});