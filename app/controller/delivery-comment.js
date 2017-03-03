define(['app', 'dom7', 'service/delivery'],
        function (app, $$, deliveryService) {
            'use strict';

            var render = function () {
                var text = deliveryService.getComment();
                $$('#delivery-comment-text').val(text);
            }

            $$(document).on('click', '#delivery-comment-back', function () {
                app.view.router.back({pageName: 'delivery-payment', force: true, pushState: false, query: {'noload': true}});
                return false;
            });

            $$(document).on('click', '#delivery-comment-next', function () {
                deliveryService.saveComment($$('#delivery-comment-text').val());
                app.view.router.load({url: 'delivery-checkout.html', query: {}});
                return false;
            });

            $$(document).on('change', '#delivery-comment-text', function () {
                deliveryService.saveComment($$('#delivery-comment-text').val());
                return false;
            });

            return {
                'init': function (page) {
                    if (!deliveryService.isLoaded()) {
                        app.view.router.back({url: 'index-page.html', query: {}});
                        return;
                    }

                    render();
                }
            };
        });