define(['app', 'dom7', 'service/delivery', 'text!tpl/delivery-variants.html', ],
        function (app, $$, deliveryService, tpl) {
            'use strict';

            var productId = false;
            var copyId = false;
            var variants = [];
            var tpl = Template7.compile(tpl);
            var store = $$.createStore();

            var loadVariants = function () {
                variants = deliveryService.getVariants(productId, copyId);
            }

            var render = function () {

                if (!variants || variants.length == 0) {
                    app.view.router.back();
                    return;
                }

                var html = tpl({
                    'variants': variants,
                    'length': variants.length
                });

                $$('#delivery-variants-list').html(html);

                renderBasket();
            }

            var renderBasket = function () {
                var info = deliveryService.order.getVariantBasketDetails(productId, copyId);

                $$('#delivery-variant-total-sum').html(info.sum);
            }

            $$(document).on('change', '.delivery-variant-checkbox', function () {
                var variantId = $$(this).data('variant-id');
                var checked = $$(this).is(':checked');
                if (checked) {
                    deliveryService.order.orderVariant(productId, copyId, variantId);
                } else {
                    deliveryService.order.unOrderVariant(productId, copyId, variantId);
                }

                renderBasket();
            });


            $$(document).on('click', '#delivery-variants-next', function () {
                app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {'noload': true}});
                deliveryService.onVariantsUpdate && deliveryService.onVariantsUpdate(productId, copyId);
            });
            
            $$(document).on('click', '#delivery-variants-back', function () {
                app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {'noload': true}});
            });            
            

            return {
                'init': function (page) {
                    store.reset();
                    productId = page.query.productId;
                    copyId = page.query.copyId;

                    loadVariants();
                    render();
                }
            };
        });