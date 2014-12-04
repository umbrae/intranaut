var { viewFor } = require("sdk/view/core");

var tabs = require("sdk/tabs");
var self = require("sdk/self");
var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');
var tabutils = require('sdk/tabs/utils');


var style = Style({
  source: "#newtab-scrollbox { opacity: 0 !important; }"
})

function hideNewTabDefault(tab) {
  var lowLevelTab = viewFor(tab);
  var win = tabutils.getTabContentWindow(lowLevelTab);
  attach(style, win);
}


// Listen for tab openings.
tabs.on('open', function onOpen(tab) {

  // Both on open and ready, attempt to hide the newtab default.
  // It appears that certain new tabs will not call ready due to precaching, but will call open.
  // When ready is called however, open's hide will be irrelevant as it was not precached.
  hideNewTabDefault(tab);
  tab.on('ready', function(tab){
    hideNewTabDefault(tab);
  });

  // hack: set to about:blank first to avoid flash of old default newtab while the other tab is loading
  // tab.url = "about:blank";

  tab.url = self.data.url("build/html/tab.html");
});
