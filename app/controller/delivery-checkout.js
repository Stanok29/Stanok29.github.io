define(['app', 'dom7', 'service/delivery', 'text!tpl/delivery-checkout.html'],
        function (app, $$, deliveryService, tpl) {
            'use strict';


            var tpl = Template7.compile(tpl);

            var render = function () {

                var info = deliveryService.checkout.getInfo();
                var shipping = deliveryService.shipping.getShippingInfo();
                var payment = deliveryService.payment.getPaymentInfo();


                var html = tpl({
                    'items': info.items
                });

                $$('#delivery-checkout-list').html(html);
                $$('.delivery-checkout-total').text(info.sum.money());

                if (shipping) {
                    $$('.delivery-checkout-total2').text((info.sum + shipping.method.cost).money());
                    $$('#delivery-checkout-shipping-cost').text(shipping.method.cost);
                    $$('#delivery-checkout-shipping-name').text(shipping.method.name_ru);
                    $$('#delivery-checkout-shipping-info').html(shipping.address.notags() + '<br>В ' + shipping.date.notags());
                    $$('#delivery-checkout-contacts').html(shipping.name.notags() + '<br>' + shipping.phone.notags());
                } else {
                    $$('.delivery-checkout-total2').text((info.sum).money());
                }


                if (payment) {
                    $$('#delivery-checkout-payment-name').html(payment.method.name_ru);
                }

            }


            $$(document).on('click', '#delivery-checkout-back', function () {
                app.view.router.back({pageName: 'delivery-comment', force: true, pushState: false, query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-checkout-back-shipping', function () {
                app.view.router.back({pageName: 'delivery-shipping', force: true, pushState: false, query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-checkout-back-info', function () {
                app.view.router.back({pageName: 'delivery-shipping', force: true, pushState: false, query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-checkout-back-payment', function () {
                app.view.router.back({pageName: 'delivery-payment', force: true, pushState: false, query: {}});
                return false;
            });


            $$(document).on('click', '#delivery-checkout-back-products', function () {
                app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-checkout-next', function () {

                deliveryService.order.sendOrder(function () {
                    deliveryService.order.reset();
                    app.view.router.load({url: 'delivery-success.html', query: {}});
                });
                return false;
            });

            return {
                'init': function (page) {

                    if (!deliveryService.isLoaded()) {
                        app.view.router.load({url: 'index-page.html', query: {}});
                        return;
                    }

                    render();

                }
            };
        });