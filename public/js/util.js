//Standart js module setup
this.Embed = this.Embed || {};
//
(function(my){
my.Toogle = Backbone.View.extend({
    initialize: function(){
        console.log('Toogle initializing ...');
        this.render();
    },
    events: {
        "click #sharelink": "on_click"
    },
    render: function(){
        this.$el = $('body');
        this.div = this.$el.find(".share")
        this.div.hide();
    },
    //On click toogle div 
    on_click: function(event){
       this.div.toggle();
    }
})

// To allow event, remember that a listener can only be
// added to the childs elements of el.

my.SerieV = Backbone.View.extend({
    // The iframe content ,  html for embed , copy  to your
    // html blog page 
    iframe: '<textarea>&lt;iframe width="100%" height="620" src="http://senegalouvert.org/data/{{dataset.name}}/embed/#" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;</textarea>';	
    initialize: function(){
        console.log('SerieV initializing ...');
        this.$el = $('body');
        this.div = this.$el.find(".share-panel-embed")
        this.render();
    },	
    events: {
        "change .editor-series-group select": "on_click"
    },
    //  remplace  the url  and add all selected series
    //  will be used to display graph
    on_click: function(event){
        var str = []
        var opt_selected  = $(
                ".editor-series-group select option:selected")
        opt_selected.each(
            function () {
                str.push($(this).text());
                });
	iframe = this.iframe.replace("#",  encodeURIComponent(str));
        this.div.html(
            iframe );
        }
});
var s =  new my.SerieV({el: $('body')});
}(this.Embed));

new Embed.Toogle();
new Embed.SerieV();


