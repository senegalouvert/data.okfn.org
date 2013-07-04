Toogle =  Backbone.View.extend({
    initialize: function(){
        this.render();
    },
    events: {"click #sharelink": "on_click"},
    render: function(){
        //
    },
    on_click: function(event){
        $(".share").toggle()
    }
});
// To allow event, remember that a listener can only be
// added to the childs elements of el.
var to =  new Toogle({el:$(".btn-group")});
