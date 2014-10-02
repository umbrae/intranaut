var options = (function() {

  var loadOptions = function() {
    chrome.storage.sync.get({
      data_url: ''
    }, function(items) {
      $('#data_url').val(items.data_url);
    });
  }

  var saveOptions = function() {
    chrome.storage.sync.set({
      "data_url": $('#data_url').val()
    });

    localStorage.setItem('config_last_fetch', 0);

    $('#status').text("saved").show().delay(1000).fadeOut();
  }

  var init = function() {
    $(function() {
      loadOptions();

      $('#options').on('submit', function(e) {
        e.stopPropagation();
        e.preventDefault();

        saveOptions();
      });
    });
  };

  return {
    "init": init,
  };

}());

options.init();