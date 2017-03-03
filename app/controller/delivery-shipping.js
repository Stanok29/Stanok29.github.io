define(['app', 'dom7', 'service/delivery', 'text!tpl/delivery-shipping.html', 'moment', 'service/storage'],
        function (app, $$, deliveryService, tpl, moment, storage) {
            'use strict';


            var tpl = Template7.compile(tpl);
            var store = $$.createStore();
            var methods = false;

            moment.locale('ru');
            var shippingDate = moment().add(10 - moment().minutes() % 10, 'minutes');

            var loadMethods = function (cb) {
                deliveryService.shipping.getMethods(function (data) {
                    methods = data;
                    cb();
                }.cb(store));
            }

            var render = function () {

                if (!methods || methods.length == 0) {
                    $$('#delivery-shipping-next').removeClass('notactive');
                }

                var html = tpl({
                    'methods': methods
                });


                $$('#delivery-shipping-methods-list').html(html);

                var model = deliveryService.shipping.getShippingInfo();
                if (model) {
                    $$('#delivery-shipping-contact-name').val(model.name);
                    $$('#delivery-shipping-contact-phone').val(model.phone);
                    $$('#delivery-shipping-contact-address').val(model.address);
                    shippingDate = moment.unix(model.dateUnix);

                    if (model.methodId) {
                        $$('#delivery-shipping-item-' + model.methodId).click();
                        if (model.methodChildId) {
                            $$('#delivery-shipping-item-' + model.methodId + '-' + model.methodChildId).click();
                        }
                    }
                }

                storage.deliveryStorage.data(function (data) {
                    if (data && !model) {
                        $$('#delivery-shipping-contact-name').val(data.name);
                        $$('#delivery-shipping-contact-phone').val(data.phone);
                        $$('#delivery-shipping-contact-address').val(data.address);
                    }
                });

                renderDate();
                renderSettings();

            }

            var renderDate = function () {
                function capitalizeFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                $$('#delivery-shipping-methods-date-day').html(shippingDate.format('DD'));
                $$('#delivery-shipping-methods-date-month').html(capitalizeFirstLetter(shippingDate.format('MMM')));
                $$('#delivery-shipping-methods-date-year').html(shippingDate.format('YYYY'));
                $$('#delivery-shipping-methods-date-hour').html(shippingDate.format('HH'));
                $$('#delivery-shipping-methods-date-min').html(shippingDate.format('mm'));

                saveShipping();
            }

            var renderSettings = function () {
                deliveryService.getSettings(function (settings) {
                    $$('#delivery-shipping-settings-info').html(settings.shippingMessage);
                });
            }

            var parseShippingModel = function () {
                var model = {
                    'methodId': false,
                    'methodChildId': false,
                    'name': false,
                    'phone': false,
                    'address': false,
                    'date': false,
                    'dateUnix': false

                };

                var method = $$('.delivery-shipping-method:checked');
                if (method.length) {
                    model.methodId = method.data('id');
                    model.methodChildId = method.data('child-id');
                }

                model.name = $$('#delivery-shipping-contact-name').val();
                model.phone = $$('#delivery-shipping-contact-phone').val();
                model.address = $$('#delivery-shipping-contact-address').val();
                model.date = shippingDate.format('HH:mm DD.MM.YYYY');
                model.dateUnix = shippingDate.unix();

                return model;
            }

            var saveShipping = function () {
                var model = parseShippingModel();
                deliveryService.shipping.saveShippingInfo(model);
                storage.deliveryStorage.save(model);

                if (deliveryService.shipping.checkShippingInfo()) {
                    $$('#delivery-shipping-next').removeClass('notactive');
                } else {
                    $$('#delivery-shipping-next').addClass('notactive');
                }
            }

            $$(document).on('click', '#delivery-shipping-methods-date-day-inc', function () {
                shippingDate.add(1, 'days');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-day-dec', function () {
                shippingDate.subtract(1, 'days');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-month-inc', function () {
                shippingDate.add(1, 'months');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-month-dec', function () {
                shippingDate.subtract(1, 'months');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-year-inc', function () {
                shippingDate.add(1, 'year');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-year-dec', function () {
                shippingDate.subtract(1, 'year');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-hour-inc', function () {
                shippingDate.add(1, 'hours');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-hour-dec', function () {
                shippingDate.subtract(1, 'hours');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-min-inc', function () {
                shippingDate.add(5, 'minutes');
                renderDate();
                saveShipping();
                return false;
            });
            $$(document).on('click', '#delivery-shipping-methods-date-min-dec', function () {
                shippingDate.subtract(5, 'minutes');
                renderDate();
                saveShipping();
                return false;
            });

            $$(document).on('change', '.delivery-shipping-method, #delivery-shipping-contact-name, #delivery-shipping-contact-phone, #delivery-shipping-contact-address', function () {
                saveShipping();
            });

            $$(document).on('click', '#delivery-shipping-next', function () {

                if (!deliveryService.shipping.checkShippingInfo()) {
                    return;
                }
                
                app.view.router.load({url: 'delivery-payment.html', query: {}});
                return false;
            });

            $$(document).on('click', '#delivery-shipping-back', function () {
                app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {'noload': true}});
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