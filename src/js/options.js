var options = (function() {

  var loadOptions = function() {
    chrome.storage.sync.get({
      data_url: ''
    }, function(items) {
      $('#data_url').val(items.data_url);
    });
  }

  var showStatus = function(t) {
    $('#status').text(t).show().delay(1000).fadeOut();
  }

  var saveOptions = function() {
    chrome.storage.sync.set({
      "data_url": $('#data_url').val()
    });

    localStorage.setItem('config_last_fetch', 0);

    showStatus("saved");
  }

  var resetStorage = function() {
    chrome.storage.local.set({
      "config": null,
      "config_last_fetch": null
    })

    showStatus("cleared");
  }

  var init = function() {
    $(function() {
      loadOptions();

      $('#options').on('submit', function(e) {
        e.stopPropagation();
        e.preventDefault();

        saveOptions();
      });

      $('#reset').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        resetStorage();
      })
    });
  };

  return {
    "init": init,
  };

}());

options.init();