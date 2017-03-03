define(['config', 'service/storage', 'lang/message'], function (config, storage, langService) {
    'use strict';
    var firstLogin = {
        title: '{{lang "service-popup-0"}}',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="q-round-icon sprite-img">q</i></div><div>\n\
<span>{{lang "service-popup-1"}}</span></div></div>\n\
<div class="gift-pop-item"><div><div class="earn-icon">+10<i class="points-icon sprite-img">C</i></div></div><div>\n\
<span>{{lang "service-popup-2"}}</span></div></div><div class="gift-pop-item"><div><i class="coin-present-icon sprite-img">G</i></div><div>\n\
<span>{{lang "service-popup-3"}}</span></div></div></div>',
        class: 'alert-done-popup',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true,
            }],
        demo: true,
        once: true,
        id: 1,
    };
    var firstCompanyClick = {
        title: '{{lang "service-popup-5"}}',
        class: 'alert-done-popup',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="points-icon sprite-img">0</i></div><div>\n\
<span>{{lang "service-popup-6"}} </span></div></div><div class="gift-pop-item"><div><i class="points-icon sprite-img">P</i></div><div>\n\
<span>{{lang "service-popup-7"}}</span></div></div><div class="gift-pop-item"><div><i class="points-icon sprite-img">Q</i></div><div>\n\
<span>{{lang "service-popup-8"}} </span></div></div></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true,
            }],
        demo: true,
        once: true,
        id: 2,
    };
    var firstPresentClick = {
        title: '{{lang "service-popup-9"}}',
        class: 'alert-done-popup',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="q-round-icon sprite-img">q</i></div><div>\n\
<span>{{lang "service-popup-10"}}</span></div></div></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true,
            }],
        demo: false,
        once: true,
        id: 3
    };
    var firstPresentClickDemo = {
        title: '{{lang "service-popup-11"}}',
        class: 'alert-done-popup',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="auth-icon sprite-img">z</i></div><div>\n\
<span>{{lang "service-popup-12"}}</span></div></div></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }, {
                text: '{{lang "service-popup-13"}}',
                ok: false
            }],
        demo: true,
        once: false,
        type: 'confirm',
        id: 4,
    };
    var firstPresent = {
        title: '{{lang "service-popup-14"}}',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-15"}} <div class="clearfix alert-done"><div>+10<i class="points-icon sprite-img">C</i></div>{{lang "service-popup-16"}}</div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true,
                onClick: function () {
                    show(firstPresentAfter)
                }
            }],
        demo: false,
        once: true,
        id: 5
    };
    var firstPresentAfter = {
        title: '{{lang "service-popup-17"}}',
        class: 'alert-done-popup',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="alert-icon sprite-img">D</i></div><div>\n\
<span>{{lang "service-popup-18"}}</span></div></div><div class="gift-pop-item"><div><i class="q-round-icon sprite-img">q</i></div><div>\n\
<span>{{lang "service-popup-19"}}</span></div></div><div class="gift-pop-item"><div><i class="alert-icon sprite-img">Q</i></div><div>\n\
<span>{{lang "service-popup-20"}}</span></div></div><div class="gift-pop-item"><div><i class="pr3-round-icon sprite-img">9</i></div><div>\n\
<span>{{lang "service-popup-21"}}</span></div></div></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: false,
        once: true,
        id: 6
    };
    var firstChargeClick = {
        title: '{{lang "service-popup-22"}}',
        class: 'alert-done-popup',
        text: '<div class="gift-pop"><div class="gift-pop-item"><div><i class="points-icon sprite-img">Q</i></div><div>\n\
<span>{{lang "service-popup-23"}}</span></div></div></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: true,
        once: true,
        id: 7
    };
    var charge = {
        title: '{{lang "service-popup-24"}}',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-25"}}<div class="rise-bonus text-center">+<label class="popup-charge-coins"></label><i class="points-icon sprite-img">C</i></div>\n\<div class="rise-popup">\n\
<span class="text-center">{{lang "service-popup-26"}}</span><div class="message-rate"><a href="#" class="selected"><i class="icon-star-filled sprite-img"></i></a><a href="#" class="selected"><i class="icon-star-filled sprite-img"></i></a><a href="#" class="selected"><i class="icon-star-filled sprite-img"></i></a><a href="#" class="selected"><i class="icon-star-filled sprite-img"></i></a>\n\
<a href="#" class="selected"><i class="icon-star-filled sprite-img"></i></a></div><textarea id="pupup-rate-text" placeholder="{{lang "service-popup-27"}}"></textarea></div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }, {
                text: '{{lang "service-popup-13"}}',
                ok: false
            }],
        demo: false,
        once: false,
        id: 8
    };
    var rateNeg = {
        title: '{{lang "service-popup-28"}}',
        class: 'alert-done-popup',
        title_icon: '<div class="alert-icon star-icon sprite-img">A</div>',
        text: '{{lang "service-popup-29"}}',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: false,
        once: false,
        id: 9
    };
    var unavailabePresent = {
        title: '{{lang "service-popup-30"}}',
        class: 'alert-done-popup',
        title_icon: '<div class="alert-icon smile-icon sprite-img">.</div>',
        text: '{{lang "service-popup-31"}}',
        buttons: [
            {
                text: '{{lang "service-popup-4"}}',
                ok: true
            },
        ],
        demo: true,
        once: false,
        id: 10
    };
    var ratePos = {
        title: '{{lang "service-popup-32"}}',
        class: 'alert-done-popup',
        title_icon: '<div class="alert-icon heart-icon sprite-img">2</div>',
        text: '{{lang "service-popup-33"}}',
        buttons: [{
                text: '{{lang "service-popup-13"}}',
                ok: true
            }],
        demo: false,
        once: false,
        id: 11
    };
    var presentSuccess = {
        title: '{{lang "service-popup-34"}}',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-35"}} <div class="clearfix alert-done"><div>+10<i class="points-icon sprite-img">C</i>\n\
</div>{{lang "service-popup-36"}}</div>',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true,
            }],
        demo: false,
        once: false,
        id: 12
    };
    var shareNoRate = {
        title: '{{lang "service-popup-37"}}',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-38"}}',
        buttons: [{
                text: '{{lang "service-popup-13"}}',
                ok: true
            }],
        demo: false,
        once: false,
        id: 13
    };
    var geolocationError = {
        title: '{{lang "service-popup-39"}}',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-40"}}',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: true,
        once: true,
        id: 14
    };
    var email = {
        title: 'Loya',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-41"}}',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: true,
        once: false,
        id: 16
    };
    var shared = {
        title: 'Loya',
        class: 'alert-done-popup',
        text: '{{lang "service-popup-42"}}',
        buttons: [{
                text: '{{lang "service-popup-4"}}',
                ok: true
            }],
        demo: false,
        once: false,
        id: 17
    };
    
    var showHandler = null;
    var couldBeShown = function (key, callback)
    {
        storage.popups.data(function (result) {
            if (result[key])
                callback(false);
            else
                callback(true);
        });
    };
    var setAsShown = function (key, callback) {
        storage.popups.data(function (result) {
            result[key] = true;
            storage.popups.save(callback);
        });
    };
    var show = function (popup, okCallback, cancelCallback) {
        if (!showHandler)
            return console.log('showHandler is not setted')

        //проверка, можно ли показывать в данном режиме
        if (config.demo && !popup.demo)
            return;
        var key = popup.id;
        couldBeShown(key, function (can) {
            if (!can)
                return;
            if (popup.once)
                setAsShown(key, function () {
                });
            if (showHandler)
            {
                var compiled = JSON.parse(JSON.stringify(popup));

                compiled.text = Template7.compile(compiled.text)();
                compiled.title = Template7.compile(compiled.title)();

                for (var i = 0; i < compiled.buttons.length; i++)
                {
                    compiled.buttons[i].text = Template7.compile(compiled.buttons[i].text)();
                }

                showHandler(compiled, okCallback, cancelCallback);

            }
        });
    };
    return {
        popups: {
            firstLogin: firstLogin,
            firstCompanyClick: firstCompanyClick,
            firstPresentClick: firstPresentClick,
            firstPresentClickDemo: firstPresentClickDemo,
            firstPresent: firstPresent,
            firstPresentAfter: firstPresentAfter,
            firstChargeClick: firstChargeClick,
            charge: charge,
            ratePos: ratePos,
            rateNeg: rateNeg,
            unavailabePresent: unavailabePresent,
            presentSuccess: presentSuccess,
            shareNoRate: shareNoRate,
            geolocationError: geolocationError,
            email: email,
            shared: shared
        },
        show: show,
        /*
         * handler - function that should handle an popup's template ({title, text, onclick}) and additional okHandler (passed into show method)
         */
        init: function (handler)
        {
            showHandler = handler;
        }
    };
});


