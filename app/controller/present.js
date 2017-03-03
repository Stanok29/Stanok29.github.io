define(['app', 'service/api', 'text!tpl/presents.html', 'dom7', 'qrcode', 'service/user', 'service/event', 'service/company', 'service/notify', 'service/share', 'service/popup'],
        function (app, api, tpl, $$, qrcode, userService, hub, companyService, notify, shareService, popup) {
            'use strict';

            var present;
            var companyId;
            var presentId;

            var store = $$.createStore();

            var qr = null;

            var render = function (clean) {
                if (!present)
                    return;

                if (clean)
                    $$('#present-qr-code').html('');

                var price = present.price ? present.price : 0;
                $$('#present-name').html(present[ 'name_' + app.langService.language()]);
                $$('#present-cost').prepend('-' + present.cost);
                $$('#present-image').attr('src', present.imgJs);

                $$('#present-image').show();

                qr = new qrcode(document.getElementById("present-qr-code"), {
                    text: "",
                    width: 236,
                    height: 236,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: qrcode.CorrectLevel.H
                });

                userService.getUser(function (user) {
                    qr.makeCode(JSON.stringify({
                        presentId: presentId,
                        operation: api.operations.gift,
                        userId: user.currentUser.id
                    }));
                }.cb(store));


            };

            return {
                'init': function (page) {
                    store.reset();

                    qr = null;

                    companyId = page.query.cid;
                    presentId = page.query.pid;

                    popup.show(popup.popups.firstPresentClick);

                    companyService.getPresent({presentId: presentId, companyId: companyId, fromServer: true}, function (result) {
                        present = result;
                        render(true);
                        notify.shortStart();
                    }.cb(store));

                    app.view.params.swipeBackPage = true;

                    var goBackToCompany = function () {
                        app.view.router.back();
                    };

                    shareService.setRateHandler(goBackToCompany);

                    var pageBackCb = app.f7.onPageBack('present', function (page) {
                        notify.shortStop();
                        shareService.removeRateHandler();
                        pageBackCb.remove();
                    });
                }
            };
        });