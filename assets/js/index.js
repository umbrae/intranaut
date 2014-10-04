var intranaut = (function() {
  var REFRESH_TIME = 600;

  function now() {
    return Math.floor((new Date()).getTime() / 1000);
  }

  function parseConfig(cfg) {
    $('.navbar-brand-name').text(cfg.name);

    if (cfg.logo) {
      $('.logo').attr('src', cfg.logo);
    }

    loadPanels(cfg.panels);
  }

  function loadConfig() {
    var lastFetch = localStorage.getItem('config_last_fetch');

    if (lastFetch) {
      config = JSON.parse(localStorage.getItem('config'));
      if (config) {
        parseConfig(config);
      }
    }

    if ((now() - lastFetch) > REFRESH_TIME) {
      chrome.storage.sync.get('data_url', function(items) {
        $.get(items.data_url, function(response) {
          localStorage.setItem('config_last_fetch', now())
          localStorage.setItem('config', response);

          if (!lastFetch) {
            parseConfig(JSON.parse(response));
          }
        });
      });

      return;
    }
  }

  function loadPanels(panels) {
    var template = $('#panel-template');
    var panelList = $('#draggablePanelList');

    // Todo: Merge appending panels and sorting of panels, below
    $.each(panels, function(i, panel) {
      var el = template.clone().removeClass('hide');
      el.find('.panel-name').text(panel.name)
      el.attr('id', 'panel-' + panel.id)

      var group = el.find('.list-group');
      $.each(panel.contents, function(i, content) {
        // Just links for now
        var a = $('<a />')
          .attr('href', content.url)
          .text(content.name)
          .addClass('list-group-item');

        if (content.badge) {
          a.append($('<span class="badge" />').text(content.badge));
        }

        group.append(a);
      })

      panelList.append(el);
    });

    // hax to get display of panels to be nice and even
    // todo: set height by row, update on order?
    var maxHeight = Math.max.apply(null, panelList.find('li').map(function() { return $(this).height(); }))
    panelList.find('li').height(maxHeight);

    // Todo: merge this with loading of panels, above
    if (localStorage.getItem('panel-sorting')) {
      var sorting = JSON.parse(localStorage.getItem('panel-sorting'));
      var newList = [];

      $(sorting).each(function(i, el_id) {
        newList.push(panelList.find('#' + el_id).detach())
      });
      newList.push(panelList.find('li').detach())

      panelList.append(newList)
    }

    panelList.sortable({
      handle: '.panel-heading', 
      update: function() {
        var panel_ids = panelList.children('li').map(function() { return this.id; }).toArray();
        localStorage.setItem('panel-sorting', JSON.stringify(panel_ids));
      }
    });
  }

  function init() {
    $(document).on('ready', loadConfig);
  }

  return {
    "init": init
  };

}());

intranaut.init();
