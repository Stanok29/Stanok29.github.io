define(['app', 'dom7', 'service/delivery'],
        function (app, $$, deliveryService) {
            'use strict';




            var render = function () {
                deliveryService.getSettings(function (settings) {
                    $$('#delivery-success-text').html(settings.successMessage);
                });
            }

            $$(document).on('click', '#delivery-success-done', function () {
                app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {'pageId' : 1}});
                return false;
            });



            return {
                'init': function (page) {

                    render();

                }
            };
        });