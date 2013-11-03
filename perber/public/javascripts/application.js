Api = function(e) {
    return e.data = JSON.stringify(e.data), e.type != "GET" ? e.contentType = "application/json" : e.processData = !1, $.ajax(e)
},

Perber = {
    Model:{},
    View:{},
    Collection:{},
    Region:{},
    config:{}
};

// Model
Perber.Model.User = Backbone.Model.extend({
    defaults: {
        name: "Anonymous",
        conversation: null,
        still: null,
    },
});

Perber.Model.Me = Perber.Model.User.extend({
    defaults:{
        me:true,
        conversation:null,
        still:null,
        stream:null,
        busy:false,
        muted:false
    }
});

Perber.Collection.Users = Backbone.Collection.extend({
    model:Perber.Model.User,
});

Perber.Model.ActivityItem = Backbone.Model.extend({
    urlRoot: "/activity",
    defaults: {
        message: "null"
    }
});

Perber.Collection.ActivitysItems = Backbone.Collection.extend({
    model: Perber.Model.ActivityItem,
    url: "/activities",
    stale: true,
    unread: 0,
    limit: 50,
    page: 1,
    loading: true,
    loaded: false,
    markAsLoaded: function() {
        this.length < this.limit && (this.loaded = false), this.stale = false, this.loading = false
    },
    add: function(e, t) {
        t = t || {},
        e = _.isArray(e) ? e.slice() : [e];
        var n, r, i, s, o;
        for (n = 0, r = e.length; n < r; n++) {
            if (!(i = this._prepareModel(s = e[n], t))) {
                this.trigger("invalid", this, s, t);
                continue
            }
            Backbone.Collection.prototype.add.call(this, i, t);
        }
    }
});

// View==========================
// User
Perber.View.User = Backbone.Marionette.ItemView.extend({
    template:"#template-user",
    tagName:"li",
    className:"user noSelect"
});

// Me
Perber.View.Me = Perber.View.User.extend({
    template:"#template-me",
    className:"me noSelect",
    intervalTime:null,
});


// Navbar
Perber.View.Navbar = Backbone.Marionette.ItemView.extend({
    template: '#template-navbar',
    id : 'navbarWrapper',
});


// Sidebar
Perber.View.Sidebar = Backbone.Marionette.ItemView.extend({
    template: '#template-sidebar',
    id : 'sidebarWrapper',
    onRender:function(){
        // 绑定toggle
        this.$el.find('.sidebar').sidebar({
            debug:false,
        }).sidebar('attach events', '.toggle');
    }
});

Perber.View.ActivityItem = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    className: "activity-item",
    template: "#template-activity-item",
    initialize: function() {
        this.listenTo(this.model, "change", this.show); 
    },
    onShow: function() {
        var view = new Perber.View.ActivityItem({
            model: this.model
        });
        view.render()
    }
});

Perber.View.Activity = Backbone.Marionette.CompositeView.extend({
    tagName: "div",
    id: "activity",
    itemView: Perber.View.ActivityItem,
    itemViewContainer: "#activity-item-wrapper > ul",
    template: "#template-activity",
    history: 0,
    scrolled: !1,
    cache: null,
    events: {
        "keydown    #message": "processMessage",
    },
    initialize: function() {
        _.bindAll(this, "checkNoActivity");
        this.listenTo(this.collection, "add", this.checkNoActivity);
    },
    checkNoActivity: function() {
        if(this.collection.length != 0) {
            this.$("> .placeholder").hide();
        } else { 
            if (this.collection.stale) {
                this.$(".noactivity").hide(), 
                this.$(".loading").show()
            } else {
                console.log('没有数据')
                this.$(".noactivity").show(), 
                this.$(".loading").hide()
            }
        }
    },

    onShow: function() {
        this.userMentions();
    },
    userMentions: function() {
        var e = this;
        // Api({
        //     type: "GET",
        //     url: "/companys/" + Perber.company.id + "/users",
        //     success: function(t) {
        //         e.cache = _.map(t, function(e) {
        //             return e.type = "user", e
        //         })
        //     }
        // });
        this.$("#message").mentionsInput({
            elastic: !1
        })
    },

    processMessage: function(e) {
        var t = this;
        switch (e.keyCode) {
        case 13:
            if (!e.shiftKey) return this.$("#message").mentionsInput("val", function(message) {
                console.log(e)
                console.log(t)
                t.sendMessage(e, message)
            });
            break;
        case 8:
        case 46:
            this.history = 0
        }
    },
    sendMessage: function(e, message) {
        e.preventDefault();
        if (!$.trim(message)) return;
        this.$("#message").val("").height(20).mentionsInput("reset");

        var r = new Perber.Model.ActivityItem({
            message: message,
        });
        r.save()
        this.collection.add(r);
    }
});
// Speakpanel
// Perber.View.Speakpanel = Backbone.Marionette.ItemView.extend({
//     template: '#template-speakpanel',
//     id : 'speakpanel'
// });

// Speakform
// Perber.View.Speakform = Backbone.Marionette.ItemView.extend({
//     template: '#template-speakform',
// });

// Toolbar
// Perber.View.Toolbar = Backbone.Marionette.ItemView.extend({
//     template : "#template-toolbar",
// });



// Perber.View.PerberItem = Backbone.Marionette.ItemView.extend({
//     tagName: "li",
//     className: "perber-item",
//     template: "#template-perber-item",
// });

// //
// Perber.View.PerberList = Backbone.Marionette.CompositeView.extend({
//     tagName: "div",
//     id: "perber-list-w",
//     template: "#template-perber-list",
//     itemViewContainer: "#perber-list",
//     itemView: Perber.View.PerberItem,

//     onRender: function(){

//     }
// });


// Modal
// Perber.Region.Modal = Backbone.Marionette.Region.extend({
//     el: '#modal',
// });

