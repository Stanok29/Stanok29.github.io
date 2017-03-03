define(['app', 'dom7', 'service/delivery', 'text!tpl/delivery-payment.html'],
        function (app, $$, deliveryService, tpl) {
            'use strict';


            var tpl = Template7.compile(tpl);
            var store = $$.createStore();
            var methods = false;



            var loadMethods = function (cb) {
                deliveryService.payment.getMethods(function (data) {
                    methods = data;
                    cb();
                }.cb(store));
            }


            var render = function () {

                if (!methods || methods.length == 0) {
                    app.view.router.load({url: 'delivery-comment.html', query: {}});
                    return;
                }

                var feed = {
                    'methods': methods
                }
                var html = tpl(feed);

                $$('#delivery-payment-methods-list').html(html);

                var model = deliveryService.payment.getPaymentInfo();
                if (model) {
                    $$('#delivery-payment-method-' + model.methodId).click();
                }




            }

            var parsePaymentModel = function () {
                var model = {
                    'methodId': false
                };

                var method = $$('.delivery-payment-method:checked');
                if (method.length) {
                    model.methodId = method.data('id');
                }

                return model;
            }

            var savePayment = function () {
                var model = parsePaymentModel();
                deliveryService.payment.savePaymentInfo(model);

                if (deliveryService.payment.checkPaymentInfo()) {
                    $$('#delivery-payment-next').removeClass('notactive');
                } else {
                    $$('#delivery-payment-next').addClass('notactive');
                }
            }

            $$(document).on('change', '.delivery-payment-method', function () {
                savePayment();
            });


            $$(document).on('click', '#delivery-payment-next', function () {
                
                if (!deliveryService.payment.checkPaymentInfo()) {
                    return;
                }
                app.view.router.load({url: 'delivery-comment.html', query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-payment-back', function () {
                app.view.router.back({pageName: 'delivery-shipping', force: true, pushState: false, query: {'noload': true}});
                return false;
            });


            return {
                'init': function (page) {
                    store.reset();

                    if (!deliveryService.isLoaded()) {
                        app.view.router.back({url: 'index-page.html', query: {}});
                        return;
                    }

                    if (page.query && page.query.noload)
                        return;

                    loadMethods(function () {
                        render();
                    });

                }
            };
        });