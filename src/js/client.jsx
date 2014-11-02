var Intranaut = require('./client/intranaut.jsx');

var root = document.getElementById('intranaut');
var isOptions = root.dataset.options;

/* jshint ignore:start */
React.renderComponent(<Intranaut isOptions={isOptions} />, root);
/* jshint ignore:end */
