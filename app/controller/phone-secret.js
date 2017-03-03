define(['app', 'service/user', 'dom7'], function (app, userService, $$) {
    'use strict';

    var store = $$.createStore();

    var userInfo;
    var buttonActive = true;

    var render = function () {
        if(userInfo.telephone)
            $$('#phone-form-phone').val(userInfo.telephone);
        $$('#phone-form-secret').val(userInfo.secret);
    };

    var save = function(){
        var phone = '+' + $$('#phone-form-phone-prefix').val().trim() + $$('#phone-form-phone').val().trim();
        var secret = $$('#phone-form-secret').val();        
        
        userService.saveSecret(phone, secret, function () {
            buttonActive = true;
            app.view.router.back({pageName: 'index', force: true, pushState: false});
            
        }.cb(store), function (error) {
            buttonActive = true;    
            app.f7.alert(app.langService.get(error.error));
            
        }.cb(store));
    }

    $$(document).on('click', '#phone-form-save', function () {
        if (!buttonActive)
            return;

        buttonActive = false;

        save();
    });


    return {
        'init': function (page) {
            store.reset();
            userInfo = null;

            userService.getUser(function (user) {
                userInfo = user.currentUser;
                render();

            }.cb(store));

            app.view.params.swipeBackPage = false;
        }
    };
});