define(['service/user', 'config', 'service/notify'], function (userService, config, notify) {
    'use strict';

    var push = null;

    var unregister = function (success, error)
    {
        if (push)
            push.unregister(success, error)
    };

    var init = function (callback) {
        unregister();

        push = PushNotification.init({"android": {"senderID": "445884032612"},
            "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {}});

        push.on('registration', function (data) {
            userService.setPushToken(data.registrationId);
            console.log('push registered', data);
            // data.registrationId
        });

        //just get our notifications from server again when push occured
        push.on('notification', function (data) {
//            var localNotification = {
//                icon: 'file://img/loya_128x128.png',
//                text: "test",
//                data: data,
//                id: 120
//            };

            console.log('push', data);

            notify.forceGetNofications();
            //cordova.plugins.notification.local.schedule(localNotification);

            // data.message,
            // data.title,
            // data.count,
            // data.sound,
            // data.image,
            // data.additionalData

            if (config.platform == "iOS")
                push.finish(function () {
                    console.log('push finished')
                });
        });

        push.on('error', function (e) {
            console.log('push error', e);
            // e.message
        });

        callback && callback();
    };
    return {
        init: init,
        unregister: unregister
    };

});


