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
    },
    start:function(){
        // PeerManager.on("addpeer",this.peerAdded);
        // channel.bind("pusher:member_added",this.sendBusyMode);
        // this.requestUserMedia();
    }
});

Perber.Collection.Users = Backbone.Collection.extend({
    model:Perber.Model.User,
    loading:true,
    placeholder:null,
    initialize:function(){
        // _.bindAll(this,"pusherJoinedRoom","pusherMemberAdded","pusherMemberRemoved","userStatusChange");
        // channel.bind("pusher:subscription_succeeded", this.pusherJoinedRoom);
        // channel.bind("pusher:subscription_error", this.pusherError);
        // channel.bind("pusher:member_added", this.pusherMemberAdded);
        // channel.bind("pusher:member_removed", this.pusherMemberRemoved);
        // channel.bind("client-status-change",this.userStatusChange);
    },
    pusherError:function(e){
        log("pusherError",e);
    },
    add: function(e, t) {
        t = t || {}, e = _.isArray(e) ? e.slice() : [e];
        var n, r, i, s;
        for (n = 0, r = e.length; n < r; n++) {
            if (!(i = this._prepareModel(s = e[n], t))) {
                this.trigger("invalid", this, s, t);
                continue
            }
            this.loading && !i.get("me") && (log("Connecting to " + i.id), Perber.user.connect(i)), 
            Backbone.Collection.prototype.add.call(this, i, t);
        }
    }
});

// Model 单条文字聊天
Perber.Model.ActivityItem = Backbone.Model.extend({
    urlRoot: "/activity",
    defaults: {
        // user: {
        //     name: "Anonymous"
        // },
        message: "null"
    }
    ,
    initialize: function(e) {
        // !this.hasAttachment() && this.looksLikeCode() && this.set({
        //     attachment_type: "code"
        // }, {
        //     silent: !0
        // });

        this.set({
            loaded: !1 //默认为未读
        }, {
            silent: !0
        });

    },
});

// Collection 多条文字聊天
Perber.Collection.ActivitysItems = Backbone.Collection.extend({
    model: Perber.Model.ActivityItem,
    url: "/activities",
    stale: true,
    unread: 0,
    limit: 50,
    page: 1,
    loading: true,
    loaded: false,
    initialize: function(e) {
        // _.bindAll(this, "pusherStreamItem", "pusherOffline", "pusherJoinedRoom");
        // this.on("reset", this.markAsLoaded, this);
    },
    comparator: function(e) {
        return e.id
    },
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
            // var u = Perber.users.get(i.get("user").id);
            // if (u) {
            //     var a = u.get("conversation");
            //     a && i.get("date_create") > a.get("date_create") && i.set({
            //         conversation: a
            //     }, {
            //         silent: !0
            //     })
            // }
            
            Backbone.Collection.prototype.add.call(this, i, t);
            // this.add(e)
        }
    },
    // nextPage: function(e) {
    //     if (this.loaded) return;
    //     if (this.loading) return;
    //     var t = this.page + 1,
    //         n = this;
    //     this.loading = true, this.fetch({
    //         data: {
    //             page: t,
    //             limit: this.limit
    //         },
    //         update: true,
    //         remove: false,
    //         success: function(t, r) {
    //             r.length < n.limit && (n.loaded = true), n.page++, n.loading = false, typeof e.success == "function" && e.success()
    //         },
    //         error: function() {
    //             n.loading = false, typeof e.error == "function" && e.error()
    //         }
    //     })
    // },
    // pusherStreamItem: function(e) {
    //     var t = this.get(e.id);
    //     t ? (e.loaded = true, t.set(e)) : (e.user.id != Perber.user.id || e.atype != null) && this.add(e)
    // },
    // pusherOffline: function() {
    //     this.stale = true;
    // },
    // pusherJoinedRoom: function() {
    //     this.stale && this.fetch({
    //         data: {
    //             limit: this.limit
    //         },
    //         reset:true,
    //         success:function(collection,res){
    //             log(collection,res,"frome the server ====== success");
    //         },
    //         error:function(collection,res){
    //             log(collection,res,"frome the server ====== error");
    //         }
    //     })
    // }
});

// View==========================
// User
Perber.View.User = Backbone.Marionette.ItemView.extend({
    template:"#template-user",
    tagName:"li",
    className:"user noSelect",
    templateHelpers:{
        showingVideo:function(){
            return this.conversation && this.conversation.isActive() || this.connecting
        }
    },
    events: {
        click: "startConversation"
    },
    initialize:function(){
        _.bindAll(this,"updateTime","mediaError","render","onRender","updateBusyStatus", "updateConnectionQuality");
        this.listenTo(this.model,"change:stream",this.onRender);
        this.listenTo(this.model,"change:busy",this.updateBusyStatus);
        this.listenTo(this.model,"change:conversation",this.render);
        this.listenTo(this.model,"change:connecting",this.render);
        this.listenTo(this.model,"webrtc:failed",this.mediaError);
        this.listenTo(this.model,"Perber:leaveconversation",this.render);
        this.listenTo(this.model, "change:quality", this.updateConnectionQuality);
        setInterval(this.updateTime,1e3);
    },
    onRender:function(){
        var stream = this.model.get("stream"),
            videos = this.$("video"),
            video = videos[0];

        stream && video && (attachMediaStream(video,stream),videos.bind("contextmenu",function(e){
            e.preventDefault()
        }));
        this.updateTime();
        this.centerVideo();
    },
});

// Me
Perber.View.Me = Perber.View.User.extend({
    template:"#template-me",
    className:"me noSelect",
    intervalTime:null,
    events:{
        click:"onClick",
        mouseenter:"showAction",
        mouseleave:"showStatus"
    },
    initialize:function(){
        _.bindAll(this,"updateTime","updateConversation","onRender",
                        "updateBusyStatus","mediaError");
        this.listenTo(this.model,"change:stream",this.render);
        this.listenTo(this.model, "change:username", this.render);
        this.listenTo(this.model, "change:conversation", this.updateConversation);
        this.listenTo(this.model, "change:busy", this.updateBusyStatus);
        this.listenTo(this.model, "webrtc:failed", this.mediaError);
        this.intervalTime = setInterval(this.updateTime, 1e3);
    },
    onClose:function(){
        clearInterval(this.intervalTime);
    },
    showAction:function(){
        this.model.get("busy") ? this.$(".status").text("关闭忙碌状态") : this.$(".status").text("设为忙碌状态")
    },
    showStatus:function(){
        var e = this.model.get("busy");
        e ? (this.$(".status").text(e === !0 ? "忙碌中" : e), this.$el.addClass("busy")) : this.$el.removeClass("busy")
    },
    onClick:function(e){
        e.preventDefault();
        if (this.model.get("stream")) {
            if (!Perber.conversations.getByUser(this.model)) {
                var t = !this.model.get("busy");
                this.model.set({
                    busy: t
                });
                this.showAction();
            }
        } else {
            this.model.requestUserMedia();
        }
    },
    onRender:function(){
        var e = this.model.get("stream"),
            t = this.$("video"),
            n = t[0];
        // log("onrender",e.getVideoTracks());
        // log("onrender",e.getAudioTracks());
        if (e && n) {
            var r = e.getVideoTracks();
            log(r.length,"the video tracks");
            r.length ? (attachMediaStream(n,e),t.bind("contextmenu",function(e){
                e.preventDefault()
            })) : this.cameraError()
        }
        this.updateTime(),
        this.centerVideo();
        if (this.model.get("conversation")) {
            this.$el.addClass("conversation");
            this.$(".activity, .activity-shadow").show();
            this.$(".activity").css("border-top-color",this.model.get("conversation").getHexColour());
        } else {
            this.$el.removeClass("conversation");
            this.$(".activity, .activity-shadow").hide();
        }
    },
    updateConversation: function(e, t) {
        if(t) {
            this.$el.addClass("conversation");
            this.$(".activity, .activity-shadow").show();
            this.$(".activity").css("border-top-color",this.model.get("conversation").getHexColour());
        } else {
            this.$el.removeClass("conversation");
            this.$(".activity, .activity-shadow").hide(); 
        }
    }
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


// 侧栏 - 单条文字聊天内容
Perber.View.ActivityItem = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    className: "activity-item",
    template: "#template-activity-item",
    // events: {
    //     "click      .message a": "nativeOpenInBrowser"
    // },
    templateHelpers: {
        messageAsHtml: function() {
            console.log('messageAsHtml')
            var e = this.message;
            // return Workor.utils.nl2br(e)
            return e
            console.log(e)
        },
        // getMeta: function(e) {
        //     return meta = JSON.parse(this.attachment_meta), meta[e]
        // },
        // getLength: function(e) {
        //     var t = "second";
        //     return e = Math.max(0, e - 3), e > 60 && (e = Math.ceil(e / 60), t = "minute"), e + " " + t
        // },
        // avatarUrl:function(){
        //     return this.user.avatar ? this.user.avatar : "http://www.gravatar.com/avatar/" + md5(this.user.email) + "?s=40"
        // }
    },
    initialize: function() {
        // _.bindAll(this, "setAsLoaded", "render");
        this.listenTo(this.model, "change", this.show); 
        // setTimeout(this.setAsLoaded, 3e3);
    },
    onClose: function() {
        // this.attachmentView && this.attachmentView.close()
    },
    // onShow: function() {
        // this.attachmentView && this.attachmentView.onShow && this.attachmentView.onShow()
    // },
    onShow: function() {
        // if (this.model.hasAttachment()) {
            // var e = this.model.getAttachmentType(),
            //     t = e.replace(/-([a-z])/g, function(e) {
            //         return e[1].toUpperCase()
            //     }),
            //     n = "ActivityAttachment" + t.charAt(0).toUpperCase() + t.slice(1),
            //     r, i;
            // try {
                // r = new Workor.View[n]({
                //     model: this.model
                // })
            // } catch (s) {
                // throw new Error("Attachment template " + n + " not found")
            // }
            // r.render(),
            // this.$(".message").before(r.$el),
            // this.attachmentView = r

        // }
        // this.$(".message").length && this.$(".message").emotify(), 
        // this.$(".timeago").timeago(), 
        // this.$(".mention.user_" + Perber.user.id).addClass("me");
        // this.$(".menu a, .stream-item-menu a").tipsy({
        //     fade: !0
        // }), 
        // this.model.get("atype") != null ? this.$el.addClass("notice " + this.model.get("atype")) : this.$el.addClass("user-" + this.model.get("user_id"))
        var view = new Perber.View.ActivityItem({
            model: this.model
        });
        // this.$el.show()
        view.render()
        console.log(this)
        // this.$("#todo-list").append(view.render().el);
    }
});

// 侧栏 - 文字聊天
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

