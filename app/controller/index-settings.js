define(['app', 'dom7', 'service/user', 'service/event', 'service/cache', 'config'], function (app, $$, userService, hub, cache, config) {
    'use strict';

    var store = $$.createStore();

    var setAvatarImage = function (src)
    {
        if (src)
            $$('#index-settings-avatar').attr('data-pre-src', src);

        cache.useRightImage($$('#index-settings-avatar'));
    };

    var render = function (clean) {
        userService.getAvatar(true, function (avatar) {
            if (avatar)
                setAvatarImage(avatar);
            else
                setAvatarImage();
        }.cb(store));

        if (config.demo)
            $$('#index-settings-logout label').text(app.langService.get('controller-index-settings-0'));
    };

    var enableListeners = function () {
        hub.on('profile', 'avatar', function (info) {
            userService.getAvatar(true, function (avatar) {
                setAvatarImage(avatar)
            }.cb(store));
        });
    };

    $$(document).on('click', '#index-settings-logout', function () {
        userService.logout(function () {
            app.view.router.loadPage('auth.html');
        });
    });
    $$(document).on('click', '#index-settings-reset-social', function () {
        userService.resetSocial(function () {
            app.view.router.loadPage('auth.html');
        });
    });
    $$(document).on('click', '#index-settings-remove-user', function () {
        userService.removeUser(function () {
            app.view.router.loadPage('auth.html');
        });
    });

    enableListeners();

    return {
        'init': function () {
            store.reset();
            render();
            $$('#index-qr-button').hide();
        },
        'infinite': function () {
        }
    };

});