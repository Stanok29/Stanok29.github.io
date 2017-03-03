define(['dom7', 'service/api', 'app', 'service/user'], function ($$, api, app, userService) {
    'use strict';

    return {
        'init': function (page) {
            $$('#forget-form-submit').click(function () {
                var email = $$('#forget-form-email').val();

                userService.recoverPassword(email, function () {
                    app.f7.alert(app.langService.get('controller-forget-0'));
                }, function (err) {
                    if (err.error == "emailNotExist")
                        app.f7.alert(app.langService.get('emailNotExist'));
                    
                    else
                        app.f7.alert(app.langService.get('controller-forget-1'));
                });
            });

            app.view.params.swipeBackPage = false;
        }
    }
});