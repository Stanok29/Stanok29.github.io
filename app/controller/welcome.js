define(['app', 'service/user', 'dom7', 'service/cache'], function (app, userService, $$, cache) {
    'use strict';

    var changeLang = function (lang) {
        window.lang = lang;
        app.langService.changeLang(lang, function () {
            window.askLang = false;
            app.f7.closeWelcomeScreen();
            app.view.router.back({pageName: 'index', force: true, pushState: false});
        });
    };

    var render = function () {
        $$('.welcomescreen-closebtn').on('click', function () {
            app.view.router.load({pageName: 'index', force: true, pushState: false, query: {demo: true}});
        });

        var buttons = [{
                text: "Eesti",
                onClick: function () {
                    changeLang('ee');
                }
            },
            {
                text: "Русский",
                onClick: function () {
                    changeLang('ru');
                }
            },
            {
                text: "English",
                onClick: function () {
                    changeLang('en');
                }
            }];

        if (window.askLang)
            app.f7.actions(buttons);
//
//        $$('.swiper-slide img').each(function (i, item) {
//            cache.useRightImage($$(item));
//        });
    };

    return {
        'init': function (page) {
            app.f7.showWelcomeScreen();
            render();
            app.view.params.swipeBackPage = true;


            /*
             A07C5CA8-59EB-4EA8-9956-30B776E0FEDC
             
             
             var delegate = new cordova.plugins.locationManager.Delegate();
             
             delegate.didDetermineStateForRegion = function (pluginResult) {
             console.log('didDetermineStateForRegion:', pluginResult);
             cordova.plugins.notification.local.schedule({'text' : pluginResult.state});
             };
             
             delegate.didEnterRegion = function (pluginResult) {
             console.log('didEnterRegion:', pluginResult);
             };
             
             delegate.didStartMonitoringForRegion = function (pluginResult) {
             console.log('didStartMonitoringForRegion:', pluginResult);
             };
             
             delegate.didRangeBeaconsInRegion = function (pluginResult) {
             console.log('didRangeBeaconsInRegion:', pluginResult);
             };
             
             var uuid = '00000000-0000-0000-0000-000000000000';
             var identifier = 'ibecom';
             var minor = 4;
             var major = 4;
             var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);
             
             cordova.plugins.locationManager.setDelegate(delegate);			
             
             cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion);
             //cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion);		
             
             */
        }
    };
});