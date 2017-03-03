define(['qrcode', 'service/user', 'app', 'service/api', 'dom7', 'service/notify', 'config', 'service/popup'],
        function (qrcode, userService, app, api, $$, notify, config, popup) {
            'use strict';

            var qr = null;
            var store = $$.createStore();

            var render = function ()
            {
                $$('#qrcode-code').html('');

                qr = new qrcode(document.getElementById("qrcode-code"), {
                    text: "",
                    width: 236,
                    height: 236,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: qrcode.CorrectLevel.H
                });

                console.log(qr);

                userService.getUser(function (user) {
                    var text = JSON.stringify({
                        userId: user.currentUser.id,
                        operation: api.operations.charge
                    });
                    console.log(text);
                    qr.makeCode(text);

                    if (!config.demo)
                        notify.shortStart();
                }.cb(store));
            };

            return {
                'init': function (page) {
                    store.reset();
                    render();

                    var pageBackCb = app.f7.onPageBack('qrcode', function (page) {

                        if (!config.demo)
                            notify.shortStop();

                        pageBackCb.remove();
                    });

                    app.view.params.swipeBackPage = true;
                }
            }
        });