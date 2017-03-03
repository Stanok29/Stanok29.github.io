define(['dom7', 'text!tpl/messages.html', 'service/company', 'service/cache', 'service/user'], function ($$, tpl, companyService, cache, userService) {
    'use strict';

    var authors = {
        'client': 0,
        'company': 1
    };

    var store = $$.createStore();

    var tabName = 'messages';
    var loader = {};
    var items = [];
    var filterContext = {
        page: 0
    };
    var tpl = Template7.compile(tpl);
    var render = function (clean) {
        var html = tpl({'items': items});

        if (clean)
            $$('#index-' + tabName + '-list').html('');

        $$('#index-' + tabName + '-list').append(html);

        $$('.message-list img').each(function (i, item) {
            cache.useRightImage($$(item));
        });
    };

    var load = function (clean) {
        if (loader.active)
            return;

        loader.enable();

        userService.getChatContacts(function (d) {
            items = d.contacts;

            if (items.length == 0)
                $$('#index-messages-mock').css('display', '');
            else
                $$('#index-messages-mock').css('display', 'none');


            items.forEach(function (item, i, arr) {
                companyService.getCompany({companyId: item.companyId}, function (result) {
                    arr[i].imgLogo = result.imgLogo;
                }.cb(store));

                if (item.type == authors.client)
                    arr[i].client = true;
            });



            render(clean);
            loader.disable();
        }.cb(store), function (error) {
            loader.disable();
        }.cb(store));
    };

    return {
        'infinite': function () {
//            filterContext.page++;
//            load();
        },
        'init': function () {
            store.reset();

            loader = this.loader;
            load(true);
        }
    };

});