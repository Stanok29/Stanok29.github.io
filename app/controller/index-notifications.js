define(['app', 'dom7', 'text!tpl/notifications.html', 'service/notify', 'service/company', 'service/event'], function (app, $$, tpl, notifyService, companyService, hub) {
    'use strict';

    var store = $$.createStore();

    var loader = {};
    var currentNotifications = [];

    var tpl = Template7.compile(tpl);

    var render = function (clean) {
        if (clean)
            $$('#index-notifications-list').html('');

        currentNotifications = currentNotifications.sort(function (a, b) {
            if (b.date < a.date)
                return -1;
            else if (b.date == a.date)
                return 0;
            else
                return 1;
        });

        if (currentNotifications.length == 0)
            $$('#index-notifications-mock').css('display', '');
        else
            $$('#index-notifications-mock').css('display', 'none');


        var html = tpl({notifications: currentNotifications});

        $$('#index-notifications-list').append(html);
    };

    /*
     * Обработка входящих нотификаций
     */
    var handleNotifications = function (notifications) {


        var handleNotification = function (i) {

            switch (notifications[i].type)
            {

                case notifyService.types.addNewCompany:
                    break;

                case notifyService.types.addNewPresent:
                    //тут бы надо слать-получать всякую инфу о подарке
                    notifications[i].message = app.langService.get('controller-index-notifications-1');

                    if (notifications[i].present)
                    {
                        notifications[i].present.name = notifications[i].present['name_' + app.langService.language()];

                        companyService.constructImage({companyId: notifications[i].companyId, img: notifications[i].present.img, width: 84, height: 84}, function (rightImage) {
                            notifications[i].present.img = rightImage;
                        }.cb(store));
                    }
                    currentNotifications.push(notifications[i]);
                    break;

                case notifyService.types.newMessageCompany:
                    if (notifications[i].coins)
                    {
                        notifications[i].message = app.langService.get('controller-index-notifications-5');
                        currentNotifications.push(notifications[i]);
                    }
                    break;

                case notifyService.types.addCoins:
                    notifications[i].message = app.langService.get('controller-index-notifications-2');
                    currentNotifications.push(notifications[i]);
                    break;

                case notifyService.types.removeCoins:
                    notifications[i].remove = true;

                    if (notifications[i].present)
                    {
                        notifications[i].present.name = notifications[i].present['name_' + app.langService.language()];

                        companyService.constructImage({companyId: notifications[i].companyId, img: notifications[i].present.img, width: 84, height: 84}, function (rightImage) {
                            notifications[i].present.img = rightImage;
                        }.cb(store));
                    }

                    notifications[i].message = app.langService.get('controller-index-notifications-3');
                    currentNotifications.push(notifications[i]);
                    break;

                case notifyService.types.addToFavorite:
                    notifications[i].message = app.langService.get('controller-index-notifications-4');
                    currentNotifications.push(notifications[i]);
                    break;

                case notifyService.types.maillingPush:
                    currentNotifications.push(notifications[i]);
                    notifyService.markMaillingPushAsRead(notifications[i].maillingId);
                    break;

                default:
                    currentNotifications.push(notifications[i]);
                    break;
            }
        };

        for (var i = 0; i < notifications.length; i++)
            handleNotification(i);

    };

    var loadNewNotifications = function (notifications) {
        handleNotifications(notifications);
        render(true);
    };

    var loadNotifications = function () {
        if (loader.active)
            return;

        loader.enable();

        if (currentNotifications.length == 0)
        {
            var notifications = notifyService.getNotifications();
            handleNotifications(notifications);
        }


        render(true);
        loader.disable();

    };

    var enableListeners = function () {
        hub.on('notification', 'new', function (info) {
            loadNewNotifications(info.notifications);
        });

        hub.on('notification', 'reset', function () {
            currentNotifications = [];
        });
    };

    enableListeners();

    return {
        'init': function (page) {
            loader = this.loader;
            store.reset();

            loadNotifications();
            notifyService.readNotifications();


        },
        infinite: function () {
            return;
        }
    };
});