/* required by bootstrap, so we put it in the global space. Probably hacky, but it works. */
window.$ = window.jQuery = require('jquery');

require('../vendor/snooboots/js/bootstrap.min.js');

var React = require('react');
var Intranaut = require('./client/intranaut.jsx');


var root = document.getElementById('intranaut');
var isOptions = root.dataset.options;

/* jshint ignore:start */
React.renderComponent(<Intranaut isOptions={isOptions} />, root);
/* jshint ignore:end */
