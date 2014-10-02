$(function() {
  var panelList = $('#draggablePanelList');

  function now() {
    return Math.floor((new Date()).getTime() / 1000);
  }

  function parseConfig(cfg) {
    $('.navbar-brand-name').text(cfg.name);

    if (cfg.logo) {
      $('.logo').attr('src', cfg.logo);
    }

    var template = $('#panel-template');

    $.each(cfg.panels, function(i, panel) {
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

      $('#draggablePanelList').append(el);
    });
  }

  function loadConfig() {
    var lastFetch = localStorage.getItem('config_last_fetch');
    if (!lastFetch || (now() - lastFetch) < 600) {
      config = JSON.parse(localStorage.getItem('config'));
      if (config) {
        parseConfig(config);
      }
      return;
    }

    chrome.storage.sync.get('data_url', function(items) {
      $.get(items.data_url, function(response) {
        localStorage.setItem('config_last_fetch', now())
        localStorage.setItem('config', response);
        parseConfig(JSON.parse(response));
      });
    });
  }

  loadConfig();

  // hax to get sorting to work properly
  var maxHeight = Math.max.apply(null, panelList.find('li').map(function() { return $(this).height(); }))
  panelList.find('li').height(maxHeight);

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
          $('.panel', panelList).each(function(index, elem) {
               var $listItem = $(elem),
                   newIndex = $listItem.index();

               // Persist the new indices.
          });

          var panel_ids = panelList.children('li').map(function() { return this.id; }).toArray();
          localStorage.setItem('panel-sorting', JSON.stringify(panel_ids));
      }
  });

});