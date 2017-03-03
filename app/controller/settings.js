define(['app', 'service/user', 'dom7', 'service/geolocation'], function (app, userService, $$, geo) {
    'use strict';

    var store = $$.createStore();
    var lang;

    var render = function () {
        var option = $$('#settings-languages option[value=' + lang + ']');
        option.attr('selected', '');
        $$('#settings-languages-display .item-after').html(option.html());

        var location = geo.getMyPlace().country + ' ' + geo.getMyPlace().city;
        $$('#settings-location').html(location);
    };

    return {
        'init': function (page) {
            if (page.fromPage.name.match(/^smart-select-radio/))
                return;

            store.reset();

            $$('.back-hint').on('click', function () {
                //тут сохраняем настройки
                var formData = app.f7.formToJSON('#settings-form');

                var settings = {
                    language: formData.language
                };

                userService.saveSettings(settings, function () {
                    //todo: это не будет работать, надо исправить
                    $$('.back-hint').off('click');

                    app.view.router.back({pageName: 'index-page', force : true, pushState: false, query: {pageId: '5'}});
                });
            });


            userService.getSettings(function (settings) {
                lang = settings.language;

                render();
            }.cb(store));

            app.view.params.swipeBackPage = false;
        }
    };
});