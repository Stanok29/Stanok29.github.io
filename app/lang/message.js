define(['lang/ru', 'lang/en', 'lang/et', 'service/storage'], function (ru, en, et, storage) {
    'use strict';

    var localizations = {'ru': ru, 'en': en, 'ee': et, 'et': et};
    var loc = false;
    var lang;

    var detectSystemLang = function (callback) {
//        if (!config.mobile)
//            return callback('ru');

        callback(window.lang);
    };

    var loadLang = function (callback) {
//        require(['lang/' + lang], function (loadedLang) {
//            loc = loadedLang;
//            if (typeof callback == 'function')
//                callback();
//        });
        loc = localizations[lang];
        if (typeof callback == 'function')
            callback();
    };

    detectSystemLang(function (lg) {
        lang = lg;
        loadLang();
    });

    return {
        get: function (code) {
            if (!loc)
                throw Error('Языковой ресурс не был загружен');

            if(window._customLang && window._customLang[lang] && window._customLang[lang][code])
                return window._customLang[lang][code];

            if (loc[code])
                return loc[code];

            return code;
        },
        changeLang: function (newLang, callback)
        {
            lang = newLang;
            storage.lang.save(lang, function () {
                loadLang(callback);
            });
        },
        language: function () {
            return (lang == 'et' ? 'ee' : lang);
        },
//        init: function (callback)
//        {
//            detectSystemLang(function (lg) {
//                lang = lg;
//                loadLang(callback);
//            });
//        }
    };
});