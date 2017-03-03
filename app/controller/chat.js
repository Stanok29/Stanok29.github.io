define(['app', 'text!tpl/chat.html', 'dom7', 'service/event', 'service/company', 'service/user', 'service/notify', 'custom/info'], function (app, tpl, $$, hub, companyService, userService, notifyService, customInfo) {
    'use strict';

    var store = $$.createStore();
    var loader = {active: false};
    var items = [];
    var filterContext = {
        page: 0,
        companyId: null
    }
    var pageModel = {
        companyName: ''
    };

    var tpl = Template7.compile(tpl);

    var renderChat = function (items, clean) {
        userService.getAvatar(true, function (avatar) {
            items = items.map(function (item) {
                if (item.my)
                    item.avatar = avatar;

                return item;
            });

            var html = tpl({'items': items, 'companyName': pageModel.companyName});

            if (clean)
                $$('#chat-messages-list').html('');

            $$('#chat-messages-list').prepend(html);


            items.length === 0 ? $$('#index-messages-mock').show() : $$('#index-messages-mock').hide();
            
            scrollDown();
        }.cb(store));
    };

    var renderPage = function () {
        $$('#chat-header-company').html(pageModel.companyName);
    };

    var scrollDown = function () {
        var height = $$('#chat-messages-list').height();
        document.getElementsByClassName('messages-content')[0].scrollTop = height;
    };

    var loadChat = function (clean) {
        if (loader.active)
            return;

        loader.active = true;

        companyService.getChat(filterContext, function (d) {
            loader.active = false;

            var foundNew = false;

            var ret = d.messages.map(function (item) {

                if (item.my || !clean) {
                    item['new'] = false;
                    return item;
                }

                if (!item['new'])
                    return item;

                if (foundNew) {
                    item['new'] = false;
                }

                foundNew = true;
                return item;

            });

            if (clean) {
                items = ret;
                renderChat(items, clean);
            }
            else {
                items = ret.concat(items);
                renderChat(ret, clean);
            }
        }.cb(store));
    }

    var loadOldChat = function (e) {
//        filterContext.page++;
//        loadChat();
        app.f7.pullToRefreshDone();
    };

    var loadUpdates = function () {
        loadChat(true);
    };

    var loadPage = function () {
        companyService.getCompany({companyId: filterContext.companyId}, function (result) {
            pageModel.companyName = result.name;
            renderPage();
        }.cb(store));
    };

    var send = function (message) {
        var item = {
            my: true,
            message: message,
            date: new Date(),
            pic: false,
            stars: false
        };
        items.push(item);
        renderChat(items, true);

        //autoscroll
        scrollDown();

        $$('#chat-message').val('');

        companyService.sendChatMessage({companyId: filterContext.companyId, message: message}, function (res) {
            console.log(res)
        }.cb(store));
    }

    var enableListeners = function () {
        //todo: над этим ещё стоит подумать
        hub.on('chat', 'new', function (info) {
            var needUpdate = false;
            for (var i = 0; i < info.messages.length; i++)
            {
                if (filterContext.companyId == info.messages[i].companyId)
                {
                    needUpdate = true;
                    break;
                }

            }

            //todo: тут пока обновляем сразу весь чат
            if (needUpdate)
                loadUpdates();

        });


    }
    enableListeners();



    return {
        'init': function (page) {
            store.reset();

            filterContext.companyId = customInfo.getCompanyId();
            loadPage();
            loadChat(true);

            notifyService.readMessages(filterContext.companyId);

            var ptrContent = $$('.pull-to-refresh-content');
            ptrContent.on('refresh', loadOldChat);

            $$('#chat-message-send').click(function () {
                var msg = $$('#chat-message').val();
                if (!msg)
                    return;

                send(msg);
            });

            app.f7.initPullToRefresh(ptrContent);

            app.view.params.swipeBackPage = true;
        }
    }
});