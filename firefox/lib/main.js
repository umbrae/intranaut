let { Cc, Ci } = require('chrome');
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

var customTabUrl = self.data.url("build/html/tab.html");

// Listen for tab openings.
tabs.on('open', function onOpen(tab) {

  // Both on open and ready, attempt to hide the newtab default.
  // It appears that certain new tabs will not call ready due to precaching
  // of about:newtab, but *will* call open. When ready is called however,
  // open's hide will be irrelevant as it was not precached.
  hideNewTabDefault(tab);
  tab.on('ready', function(tab){
    hideNewTabDefault(tab);
  });

  tab.url = customTabUrl;


  // When we've successfully loaded something into a tab, check if it's our
  // custom new tab URL. If it is, clear out the URL bar and focus it to
  // prep for quick awesomebaring.
  tab.on('ready', function(tab) {
    if (tab.url !== customTabUrl) {
      return;
    }

    var tabBrowser = tabutils.getTabBrowserForTab(viewFor(tab));
    var DOMWin = tabBrowser.contentWindow
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIWebNavigation)
      .QueryInterface(Ci.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIDOMWindow);
    var doc = DOMWin.document;
    var urlbar = doc.getElementById("urlbar");

    if (urlbar) {
      // Clear out the URL bar for quick searching, and focus it
      urlbar.value = '';
      urlbar.focus();
    }
  })
});
