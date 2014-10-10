var intranaut = (function() {
  var REFRESH_TIME = 600;

  function now() {
    return Math.floor((new Date()).getTime() / 1000);
  }

  function parseConfig(cfg) {
    $('.navbar-brand-name').text(cfg.header.name);

    if (cfg.header.url) {
      $('a.navbar-brand').attr('href', cfg.header.url)
    }

    if (cfg.header.logo) {
      $('.logo').attr('src', cfg.header.logo);
    }

    if (cfg.search) {
      loadSearch(cfg.search)
    }

    loadPanels(cfg.panels);
  }

  function loadSearch(searchCfg) {
    $('#searchString').attr({
      name: searchCfg.searchParam,
      placeholder: searchCfg.placeholder
    });
    $('#search').attr('action', searchCfg.url)
    $('#search').find('button').text(searchCfg.button_title)
    $('#search').removeClass('hide')
  }

  function loadConfig() {
    chrome.storage.local.get({
      'config_last_fetch': null,
      'config': null
    }, function(items) {
      var lastFetch = items.config_last_fetch;
      var config;

      if (items.config) {
        try {
          config = JSON.parse(items.config);
        } catch(e) {
          lastFetch = null;
          config = null;
        }
      }

      if (lastFetch && config) {
        parseConfig(config);
      }

      if (!lastFetch || (now() - lastFetch) > REFRESH_TIME) {
        chrome.storage.sync.get('data_url', function(items) {
          $.get(items.data_url, function(response) {
            try {
              var config = JSON.parse(response);
            } catch(e) {
              alert("Unable to load config. There may be a problem with your configuration file? " +
                    "Please check your options and contact your sysadmin.");
              return;
            }

            console.log(config);

            chrome.storage.local.set({
              'config_last_fetch': now(),
              'config': JSON.stringify(config)
            });

            if (!lastFetch) {
                parseConfig(config);
            }
          });
        });

        return;
      }

    });
  }

  function sortPanels(sorting) {
    var panelList = $('#draggablePanelList');
    var newList = [];

    $(sorting).each(function(i, el_id) {
      newList.push(panelList.find('#' + el_id).detach())
    });
    newList.push(panelList.find('li').detach())

    panelList.append(newList)
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
    chrome.storage.local.get('panel_sorting', function(items) {
      if (items.panel_sorting) {
        sortPanels(JSON.parse(items.panel_sorting))
      }
    })

    panelList.sortable({
      handle: '.panel-heading', 
      update: function() {
        var panel_ids = panelList.children('li').map(function() { return this.id; }).toArray();
        chrome.storage.local.set({
          'panel_sorting': JSON.stringify(panel_ids)
        });
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
