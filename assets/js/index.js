$(function() {
  var panelList = $('#draggablePanelList');

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