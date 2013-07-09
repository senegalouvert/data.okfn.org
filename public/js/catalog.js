var Catalog = {
  Models: {},
  Views: {}
};

(function(my, $) {
my.Views.Application = Backbone.View.extend({
  initialize: function () {
    var self = this;
    this.el = $(this.el);
    _.bindAll(this);
  },

  // Helpers
  // -------

  // Views
  // -------
});

my.Views.DataFile = Backbone.View.extend({
  initialize: function() {
    this.$el = $(this.el);
    _.bindAll(this);
  },

  render: function() {
    var $viewer = this.$el;
    var reclineInfo = this.model.attributes;
    $viewer.html('Loading View <img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" />');
    var table = new recline.Model.Dataset(reclineInfo);
    table.fetch().done(function() {
      if (reclineInfo.fields) {
        // HACK - TODO fix in recline
        table.fields = new recline.Model.FieldList(reclineInfo.fields);
        table.set({fields: reclineInfo.fields});
      }
      var gridView = {
          id: 'grid',
          label: 'Tableau',
          type: 'SlickGrid',
          state: {
            fitColumns: true
          }
        };
      DataViews.push(gridView); 
      var viewsForRecline = _.map(DataViews, function(viewInfo) {
        var out = _.clone(viewInfo);
        out.view = new recline.View[viewInfo.type]({
          model: table,
          state: viewInfo.state
        });
        if (!out.label) {
          out.label = out.id;
        }
        return out;
      });

      //  var explorer = new recline.View.MultiView({
      //  model: table,
      //  views: viewsForRecline,
      //  sidebarViews: []
      //});

      var explorer =  new recline.View.MultiView({
		model:table,
		views: viewsForRecline,
		sidebarViews: []	
	});

      // Starting Hack by Alioune
	//customize for embed
	var find_ = function(e){
	    return explorer.$el.find(e)
	}
	//Hack By , find the window location and check if we 
	//are renderig the embed , if so , remove the unused element
	//from template .This is an Hack for this moment , i will 
	//Try to get an more elgant solution later !
      path_name = window.location.pathname
      if( path_name.search("embed") > 0 ){
	    find_(".data-view-sidebar").hide();
          find_(".header").hide();    
	}
	//End Hack by Alioune
      $viewer.empty().append(explorer.el);
	table.query({size: table.recordCount});
    });
    return this;
  }
});

my.Views.Search = Backbone.View.extend({
  events: {
    'submit .dataset-search': 'onSearchSubmit'
  },

  initialize: function() {
    this.$el = $(this.el);
  },

  onSearchSubmit: function(e) {
    var self = this;
    e.preventDefault();
    var q = $(e.target).find('input').val();
    this.model.search(q, function(error, result) {
      self.results.reset(result);
    });
  }
});

my.Models.DataFile = Backbone.Model.extend({
});

}(Catalog, jQuery));

