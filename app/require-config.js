/**
 * configure RequireJS
 * prefer named modules to long paths, especially for version mgt
 * or 3rd party libraries
 */


var load = function () {
    require.config({
        baseUrl: "app/",
        paths: {
            'text': './lib/text/text',
            'dom7': './lib/dom7/dom7',
            'app': './bootstrap',
            'msg': './lang/message',
            'moment': './lib/moment/moment',
            'qrcode': './lib/qr/qr',
            'imgcache': './lib/imgcache.js/imgcache'
        },
        /**
         * for libs that either do not support AMD out of the box, or
         * require some fine tuning to dependency mgt'
         */
        shim: {
            'qrcode': {
                exports: 'QRCode'

            }
        },
        deps: [
            // kick start application... see bootstrap.js
            'lib/f7/welcomescreen',
                    //'app'
        ]
    });

    var lang = 'en';

    var callback = function () {
        window.lang = lang;
        require(['app'], function (app) {
        });
    };

    require(['service/storage', 'custom/info'], function (storage, info) {

        var fixedLang = info.getFixedLang();
        if (fixedLang) {
            lang = fixedLang;
            window.askLang = false;
            callback();
            return;
        }

        storage.lang.data(function (loyaLang) {
            if (loyaLang)
                lang = loyaLang;

            window.askLang = false;

            callback();
        }, function (noLang) {
            window.askLang = true;

            if (window.device)
            {
                navigator.globalization.getPreferredLanguage(
                        function (language) {
                            if (language.value.match(/ru/i))
                                lang = 'ru';
                            else if (language.value.match(/et/i))
                                lang = 'et';
                            else
                                lang = 'en';

                            callback();
                        });
            }
            else
                callback();
        });
    });


};

window.shouldRotateToOrientation = function (deg)
{
    return false;
}

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    document.addEventListener("deviceready", load, false);
} else {
    load();
}



