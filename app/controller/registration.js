define(['app', 'service/api', 'dom7', 'service/user', 'config', 'service/social', 'custom/info'], function (app, api, $$, userService, config, social, customInfo) {
    'use strict';
    var store = $$.createStore();

    var render = function () {
        if (customInfo.useSocialLogin()) {
            $$('.registration-form-social-login').show();
        }

    };

    var buttonActive = true;

    var register = function () {
        var formData = app.f7.formToJSON('#registration-form');
        var newUser = {
            email: formData['registration-form-email'],
            name: formData['registration-form-name'],
            password: '',
            dateOfBirth: Date.parse(formData['registration-form-date']),
        };

        var useEmail = document.getElementById('registration-form-email').checkValidity();
        if (!newUser.name)
            return showError('wrongName');

        if (!newUser.email || !useEmail)
            return showError('wrongEmail');

        var gender = $$('.sex-select a.selected').attr('data-gender');
        if (!gender)
            gender = null;

        newUser.gender = gender;

        userService.register(newUser, function (result) {
            app.view.router.back({pageName: 'index', force: true, pushState: false});
            buttonActive = true;
        }.cb(store), function (error) {
            console.log(error);
            app.f7.alert(app.langService.get(error.error));
            buttonActive = true;
        }.cb(store));
    };

    var showError = function (error) {
        app.f7.alert(app.langService.get(error));
        buttonActive = true;
    };

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
            app.view.router.back({pageName: 'index', force: true, pushState: false});
        }.cb(store), function (error) {
            app.f7.alert(error.error);
        }.cb(store));
    };



    var enableListeners = function () {
        $$(document).on('click', '#registration-form-register', function () {
            if (!buttonActive)
                return;

            buttonActive = false;

            register();
        });

        $$(document).on('click', '#registration-form .sex-select a', function () {
            if ($$(this).hasClass('selected')) {
                $$('.sex-select a').removeClass('selected');
            } else {
                $$('.sex-select a').removeClass('selected');
                $$(this).addClass('selected');
            }



        });

        if (!config.mobile)
            return;

        $$(document).on('click', '#registration-soc-fb', function () {
            social.fb.getStatus(function (connected) {
                social.fb.logout(function () {
                    regByFb();
                });
            }, function (off) {
                regByFb();
            });
        });

        $$(document).on('click', '#registration-soc-gp', function () {
            social.google.login(function (data) {
                regByGoogle(data);
            }, function (err) {
            });
        });
    };

    enableListeners();

    return {
        'init': function (page) {
            store.reset();
            buttonActive = true;

            app.view.params.swipeBackPage = false;

            render();
        }
    };
});