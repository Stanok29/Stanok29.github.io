define(['dom7', 'service/api', 'app', 'service/user', 'service/social', 'custom/info'], function ($$, api, app, userService, social, customInfo) {
    'use strict';

    var store = $$.createStore();

    var render = function () {
        if (customInfo.useSocialLogin()) {
            $$('.registration-form-social-login').show();
        }
    }


    var regByFb = function () {
        social.fb.login(function (token) {
            social.fb.getInfo(function (fbInfo) {
                fbInfo.facebookToken = token;
                userService.facebookAuth(fbInfo, function (result) {
                    app.view.router.back({pageName: 'index', force: true, pushState: false});
                }.cb(store), function (error) {
                    app.f7.alert(error.error);
                }.cb(store));

            });
        });
    };

    var regByGoogle = function (googleData) {
        userService.googleAuth(googleData, function (result) {
            app.view.router.back({pageName: 'index', force: true, pushState: false });
        }.cb(store), function (error) {
            app.f7.alert(error.error);
        }.cb(store));
    };

    $$(document).on('click', '#auth-login', function () {
        $$('#auth-login').addClass('disabled');

        var model = $$.getModel('auth')({'email': '', 'password': ''});

        userService.login(model, function (result) {
            app.view.router.back({pageName: 'index', force: true, pushState: false});
            $$('#auth-login').removeClass('disabled');

        }, function (error) {
            app.f7.alert(app.langService.get(error.error));
            $$('#auth-login').removeClass('disabled');

        });
    });

    $$(document).on('click', '#auth-soc-fb', function () {
        social.fb.getStatus(function (connected) {
            social.fb.logout(function () {
                regByFb();
            });
        }, function (off) {
            regByFb();
        });
    });

    $$(document).on('click', '#auth-soc-gp', function () {
        social.google.login(function (data) {
            regByGoogle(data);
        }, function (err) {
        });
    });


    return {
        'init': function (page) {
            store.reset();

            app.view.params.swipeBackPage = false;

            render();
        }
    }
});