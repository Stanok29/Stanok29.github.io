define(['service/event', 'service/api', 'config', 'lang/message'], function (hub, api, config, langService) {
    'use strict';

    var _notifications = [];

    var active = false;
    var longTimeout = 1000 * 10 * 60;

    var shortTimeout = 1000 * 5;

    var newMessages = {};

    var newMessageCount = 0;
    var notificationsCount = 0;

    var onNewMessage = function (data) {
        var info = {
            amount: data.amount,
            messages: data.messages
        };
        onChangeMessageCount();
        hub.trigger('chat', 'new', info);
    };

    var onNewNotifications = function (data) {
        var info = {
            amount: data.amount,
            notifications: data.notifications
        };
        notificationsCount += data.amount;

        onChangeNotificationCount();
        hub.trigger('notification', 'new', info);
    };

    var onChangeMessageCount = function () {
        hub.trigger('chat', 'changeCount', {count: newMessageCount});
    };

    var onChangeNotificationCount = function () {
        hub.trigger('notification', 'changeCount', {count: notificationsCount});
    };

    var onNewCompany = function (data)
    {
        hub.trigger('companies', 'new', null);
    };

    var onAddCoins = function (data)
    {
        hub.trigger('companies', 'addCoins', data);
    };

    var onRemoveCoins = function (data)
    {
        hub.trigger('companies', 'removeCoins', data);
    };

    var onNewPresent = function (data)
    {
        hub.trigger('companies', 'newPresent', data);
    };

    var onAddToFavorite = function (data)
    {
        hub.trigger('companies', 'addToFavorite', data);
    };

    var onMaillingPush = function (data)
    {
        hub.trigger('companies', 'maillingPush', data);
    };

    var types = {
        addNewCompany: 0,
        addNewPresent: 1,
        newMessageCompany: 2,
        addCoins: 3,
        removeCoins: 4,
        addToFavorite: 5,
        maillingPush: 6
    };
    /*
     * Handle incoming notifications
     */
    var handleNotifications = function (notifications)
    {
        var notifyCount = 0;
        var messageCount = 0;
        var messages = [];

        var isNew = false;
        var hasRate = false;
        //todo: надо учитывать, что нотификация может быть не новой, а обновления уже могут быть в базе
        for (var i = 0; i < notifications.length; i++)
        {
            isNew = notifications[i].new;
            if (isNew && (notifications[i].type != types.newMessageCompany || notifications[i].coins))
                notifyCount++;

            notifications[i].actual = (Date.now() - notifications[i].date < config.rateActuality) ? true : false;

            switch (notifications[i].type)
            {
                case types.addNewCompany:
                    if (isNew)
                        onNewCompany();
                    break;

                case types.addNewPresent:
                    if (isNew)
                        onNewPresent({companyId: notifications[i].companyId});
                    break;

                case types.newMessageCompany:
                    if (isNew)
                    {
                        messageCount++;
                        messages.push(notifications[i]);
                        if (notifications[i].coins)
                            onAddCoins({companyId: notifications[i].companyId, coins: notifications[i].coins, date: notifications[i].date, rate: false});

                        if (newMessages[notifications[i].companyId] === undefined)
                            newMessages[notifications[i].companyId] = 0;

                        newMessages[notifications[i].companyId] += 1;
                        newMessageCount += 1;
                    }
                    break;

                case types.addCoins:
                    if (isNew)
                    {
                        onAddCoins({companyId: notifications[i].companyId, coins: notifications[i].coins, date: notifications[i].date, rate: (notifications[i].actual && !hasRate), staffId: notifications[i].staffId});
                        hasRate = true;
                    }
                    break;

                case types.removeCoins:
                    if (isNew && notifications[i].actual)
                    {
                        onRemoveCoins({companyId: notifications[i].companyId, coins: notifications[i].coins, date: notifications[i].date, rate: (notifications[i].actual && !hasRate), staffId: notifications[i].staffId});
                        hasRate = true;
                    }
                    break;

                case types.addToFavorite:
                    if (isNew)
                        onAddToFavorite({companyId: notifications[i].companyId, date: notifications[i].date});
                    break;

                case types.maillingPush:
                    onMaillingPush({companyId: notifications[i].companyId, message: notifications[i].message});
                    break;
            }

            _notifications.push(notifications[i]);

        }

        if (notifyCount)
            onNewNotifications({amount: notifyCount, notifications: notifications});

        if (messageCount)
            onNewMessage({amount: messageCount, messages: messages});
    };

    var longFunction = null;
    var shortFunction = null;
    var shortKiller = null;

    var start = function (timeout, short) {

        var listen = function () {
            var onlyNew = short ? true : false;
            var interval;

            loadNotificatoins(onlyNew, function () {
                onlyNew = true;

                interval = setInterval(function () {
                    loadNotificatoins(onlyNew, function () {
                    });
                }, timeout);
                if (short)
                    shortFunction = interval;
                else
                    longFunction = interval;
            });
        };

        listen();
    };

    var stop = function () {
        if (longFunction)
        {
            clearInterval(longFunction);
            longFunction = null;
        }

        shortStop(true);

        _notifications = [];

        active = false;
        newMessages = {};
        newMessageCount = 0;
        notificationsCount = 0;

        hub.trigger('notification', 'reset', {});
    };

    var shortStop = function (force) {
        if (!shortFunction)
            return;

        if (force)
        {
            clearTimeout(shortKiller);
            shortKiller = null;
            clearInterval(shortFunction);
            shortFunction = null;
            return;
        }

        shortKiller = setTimeout(function () {
            clearInterval(shortFunction);
            shortKiller = null;
            shortFunction = null;
        }, 1000 * 30);

    };

    var loadNotificatoins = function (onlyNew, callback, error) {
        if (onlyNew)
            api.getNotifications({onlyNew: true}, function (res) {
                res = res.map(function (item) {
                    item.new = true;
                    return item;
                });
                handleNotifications(res, onlyNew);
                callback(_notifications);
            }, error);

        else if (_notifications.length > 0)
            callback(_notifications);

        else
            api.getNotifications({onlyNew: false}, function (res) {
                handleNotifications(res);
                callback(res);
            }, error);
    };

    return {
        init: function () {
            if (active)
                return;
            active = true;

            start(longTimeout);
        },
        stop: stop,
        getNotifications: function () {
            return _notifications;
        },
        shortStart: function () {
            shortStop(true);
            start(shortTimeout, true);
        },
        shortStop: shortStop,
        getMessageCount: function (companyId)
        {
            if (companyId)
                return newMessages[companyId];

            return newMessageCount;
        },
        readMessages: function (companyId)
        {
            if (newMessages[companyId])
                newMessageCount -= newMessages[companyId];
            newMessages[companyId] = 0;
            onChangeMessageCount();
        },
        getNotificationsCount: function () {
            return notificationsCount;
        },
        readNotifications: function () {
            notificationsCount = 0;
            onChangeNotificationCount();
        },
        //reads notifications from server
        forceGetNofications: function () {
            if (active)
                loadNotificatoins(true, function () {
                });
        },
        markMaillingPushAsRead: function (maillingPushId) {
            api.markMaillingPushAsRead({'id' : maillingPushId});
        },
        types: types
    };

});


