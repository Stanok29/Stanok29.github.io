define(['app', 'service/user', 'dom7'], function (app, userService, $$) {
    'use strict';

    return {
        'init': function (p) {
            
            $$('.views').css('opacity', 1);
            
            if(p.query.forceReload){
                window.location.reload(true);
            }
            
            if (p.query.demo)
            {
                return userService.demoLogin(function () {
                    app.view.router.loadPage('index-page.html');
                });
            }

            userService.authed(function (authed) {
                if (!authed) {
                    app.view.router.loadPage('welcome.html');
                    return;
                }


                userService.applySettings(function () {
                    userService.askSecret(function (ask) {
                        if (ask)
                            app.view.router.loadPage('phone-secret.html');
                        else
                            app.view.router.loadPage('index-page.html');
                    });

                });
            });

            app.view.params.swipeBackPage = false;
        }
    };
});