define([], function () {
    'use strict';

    var loginGP = function (callback, error) {
        window.plugins.googleplus.isAvailable(function (available) {
            if (available)
            {
                window.plugins.googleplus.login({offline: true}, function (obj) {
                    callback && callback(obj);
                },
                        function (msg) {
                            console.log('error: ' + msg);
                            error && error();
                        });

            }
            else
            {
                console.log('g+ isnot avail');
                error && error()
            }
        });
    };

    var logoutGP = function (callback, error)
    {
        window.plugins.googleplus.logout(function (ok) {
            callback && callback();
        }, function (err) {
            error && error();
        });
    };

    var loginFB = function (callback, error)
    {
        facebookConnectPlugin.login(['user_birthday', 'email'], function (result) {
            console.log('login ok', result);

            var userToken = result.authResponse.accessToken;

            callback && callback(userToken);

        }, function (err)
        {
            error && error();
        });
    };

    var logoutFB = function (callback, error)
    {
        facebookConnectPlugin.logout(function (succes) {
            callback && callback();
        }, function (err) {
            error && error()
        });
    };

    var getInfoFB = function (callback, error)
    {
        facebookConnectPlugin.api('/me?fields=email,id,name,birthday,picture,gender', [], function (result) {
            console.log('fb ok', result);

            callback && callback(result);

        }, function (error) {
            console.log('fb error', error);
            error && error();
        });
    };

    var getStatusFb = function (connected, off, error)
    {
        facebookConnectPlugin.getLoginStatus(function (success) {
            if (success.status == 'connected')
                connected && connected();
            else
                off && off();

        }, function (error) {
            error && error();
        });
    };

    var apiFb = function (path, permissions, callback, error)
    {
        facebookConnectPlugin.api(
                path,
                permissions,
                callback,
                error);
    };

    var showDialogFb = function (data, callback, error)
    {
        facebookConnectPlugin.showDialog(
                data, callback, error
                );
    };

    var google = {login: loginGP, logout: logoutGP};

    var fb = {login: loginFB, getInfo: getInfoFB, logout: logoutFB, getStatus: getStatusFb, api: apiFb, showDialog: showDialogFb};

    return {
        fb: fb,
        google: google
    };

});


