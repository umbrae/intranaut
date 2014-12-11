var self = require("sdk/self");
var tabs = require("sdk/tabs");
var tabutils = require('sdk/tabs/utils');
var { attach, detach } = require('sdk/content/mod');
var { Cc, Ci } = require('chrome');
var { Style } = require('sdk/stylesheet/style');
var { viewFor } = require("sdk/view/core");

const NEWTAB_STYLE_OVERRIDE = Style({
  source: "#newtab-scrollbox { opacity: 0 !important; }"
})

const CUSTOM_TAB_URL = self.data.url("html/tab.html");

function hideNewTabDefault(tab) {
  var lowLevelTab = viewFor(tab);
  var win = tabutils.getTabContentWindow(lowLevelTab);
  if (win) {
    attach(NEWTAB_STYLE_OVERRIDE, win);
  }
}

tabs.on('open', function onOpen(tab) {
  // On new tab open, about:newtab may be precached, in which case the tab
  // readyState will already be complete. We should hide our tab default
  // styles and navigate immediately.
  if (tab.readyState === "complete" && tab.url === "about:newtab") {
    hideNewTabDefault(tab);
    tab.url = CUSTOM_TAB_URL;
  }
});

// When we've successfully loaded something into a tab, check if it's our
// custom new tab URL. If it is, clear out the URL bar and focus it to
// prep for quick awesomebaring.
tabs.on('ready', function(tab) {
  // In the case that the tab was not precached and we're on
  // about:newtab, navigate to our custom tab url.
  if (tab.url === "about:newtab") {
    hideNewTabDefault(tab);
    tab.url = CUSTOM_TAB_URL;
  }

  // Clear and focus the URL bar for quick searching / navigating.
  if (tab.url === CUSTOM_TAB_URL || tab.url === "about:newtab") {
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
      urlbar.value = urlbar.value.replace(CUSTOM_TAB_URL, '');
      urlbar.focus();
    }
  }
})