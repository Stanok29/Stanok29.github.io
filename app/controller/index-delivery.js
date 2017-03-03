define(['app', 'dom7', 'text!tpl/delivery-list.html', 'text!tpl/delivery-copy.html', 'service/delivery', 'service/cache', 'service/user', 'custom/info', 'service/company', 'lang/message'],
        function (app, $$, tpl, tplCopy, deliveryService, cache, userService, customInfo, companyService, lang) {
            'use strict';

            var store = $$.createStore();

            var loader = {};
            var catalog = false;

            var tpl = Template7.compile(tpl);
            var tplCopy = Template7.compile(tplCopy);
            var copyIndex = 1;


            var company = false;
            var getCompany = function (cb) {
                if (company)
                    return cb(company);

                var companyId = customInfo.getCompanyId();

                companyService.getCompany({companyId: companyId}, function (result) {
                    company = result;
                    cb(company);
                });
            }

            getCompany(function (c) {
                if (c.deliveryModeEnabled)
                    $$('#delivery-basket-title').text(lang.get('index-page-Checkout'));
                else
                    $$('#delivery-basket-title').text(lang.get('index-page-Basket'));
            });


            var isElementInView = function (element, fullyInView) {
                var pageTop = $$('.index-page-content').scrollTop();
                var pageBottom = pageTop + $$('.index-page-content').height();
                var elementTop = $$(element).offset().top;
                var elementBottom = elementTop + $$(element).height();

                if (fullyInView === true) {
                    return ((pageTop < elementTop) && (pageBottom > elementBottom));
                } else {
                    return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
                }
            }

            var enableScrollListener = function () {
                $$('.index-page-content').scroll(function () {
                    $$('.delivery-load-image').each(function (i, el) {
                        if (isElementInView(el, false)) {
                            cache.useRightImage($$(el));
                        }
                    });
                });
            }


            var render = function (clean) {

                userService.ifBlocked(function (blocked) {
                    if (blocked) {
                        $$('#index-delivery-mock').show();
                        $$('#tab2-content').hide();
                    }
                    else {
                        $$('#index-delivery-mock').hide();
                        $$('#tab2-content').show();
                    }
                });

                if (clean)
                    $$('#tab2-content').html('');

                var html = tpl({'categories': catalog});

                $$('#tab2-content').append(html);
                updateBasket();

                cache.useRightImage($$('.delivery-load-image'));
                //enableScrollListener();

            };

            var loadCatalog = function (cb) {
                deliveryService.getCatalog(function (data) {
                    catalog = data;
                    cb();
                }.cb(store));
            }

            var updateBasket = function () {
                var basket = deliveryService.order.getBasketDetails();
                if (basket.number === 0) {
                    $$('#delivery-basket').addClass('none');
                } else {
                    $$('#delivery-basket').removeClass('none');
                    $$('#delivery-basket-number').html(basket.number + ' ' + lang.get(basket.number == 1 ? 'index-page-Good1' : 'index-page-Good5'));
                    $$('#delivery-basket-sum').html(basket.sum);

                }
            }



            var enableListeners = function () {
            };

            enableListeners();

            $$(document).on('change', '.delivery-product-checkbox', function () {
                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var checked = $$(this).is(':checked');
                if (checked) {
                    $$('#delivery-product-' + productId + '-' + copyId).addClass('opened');
                    var amounter = $$('#delivery-product-amount-' + productId + '-' + copyId);
                    amounter.trigger('change');

                } else {
                    $$('#delivery-product-' + productId + '-' + copyId).removeClass('opened');

                    deliveryService.order.unOrderProduct(productId, copyId);
                    updateBasket();

                    if (copyId !== '0') {
                        $$('#delivery-product-' + productId + '-' + copyId).remove();
                    }
                }

            });

            $$(document).on('click', '.delivery-product-trigger', function () {

                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var checkbox = $$('#delivery-product-checkbox-' + productId + '-' + copyId);
                $$(checkbox).is(':checked') ?
                        $$(checkbox).prop('checked', false) :
                        $$(checkbox).prop('checked', true);

                $$(checkbox).trigger('change');
                return false;
            });

            $$(document).on('click', '.delivery-product-inc', function () {
                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var amounter = $$('#delivery-product-amount-' + productId + '-' + copyId);
                var amount = amounter.val();
                amount++;
                amounter.val(amount);
                amounter.trigger('change');

                return false;
            });

            $$(document).on('click', '.delivery-product-dec', function () {
                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var amounter = $$('#delivery-product-amount-' + productId + '-' + copyId);
                var amount = amounter.val();
                amount--;
                if (amount < 1)
                    return;

                amounter.val(amount);
                amounter.trigger('change');

                return false;
            });

            $$(document).on('change', '.delivery-product-amount', function () {
                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var amount = $$(this).val();
                amount = Math.round(amount);
                if (amount < 1)
                    amount = 1;
                $$(this).val(amount);

                deliveryService.order.orderProduct(productId, copyId, amount);
                updateBasket();
            });

            $$(document).on('click', '.delivery-category-name', function () {
                $$(this).parent().toggleClass('opened');

                return false;
            });

            $$(document).on('click', '.delivery-product-variants-select', function () {

                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');

                app.view.router.load({url: 'delivery-variants.html', query: {
                        'productId': productId,
                        'copyId': copyId}
                });
                return false;
            });

            $$(document).on('click', '.delivery-product-variants-add-copy', function () {

                var productId = $$(this).data('product-id');
                var copyId = $$(this).data('copy-id');
                var newCopyId = copyIndex++;
                var product = deliveryService.findProduct(productId);

                var html = tplCopy({'product': product, 'copyId': newCopyId});
                var container = "#delivery-product-" + productId + "-" + copyId;

                $$(html).insertAfter(container);

                var amounter = $$('#delivery-product-amount-' + productId + '-' + newCopyId);
                amounter.trigger('change');
                return false;
            });

            $$(document).on('click', '#delivery-basket a', function () {

                getCompany(function (c) {
                    if (c.deliveryModeEnabled)
                        app.view.router.load({url: 'delivery-shipping.html', pushState: true, query: {}});
                });

                return false;
            });

            if (!deliveryService.onVariantsUpdate) {
                deliveryService.onVariantsUpdate = function (productId, copyId) {
                    updateBasket();

                    var buttonId = "#delivery-product-variant-select-" + productId + "-" + copyId;
                    var info = deliveryService.order.getVariantBasketDetails(productId, copyId);
                    if (info.number) {
                        $$(buttonId).html(info.number + ' ' + lang.get('index-page-Selected'));
                    } else {
                        $$(buttonId).html(lang.get('index-page-Select'));
                    }
                }
            }


            return {
                'init': function (page) {
                    loader = this.loader;
                    store.reset();


                    deliveryService.order.reset();
                    loadCatalog(function () {
                        render(true);
                    });



                },
                infinite: function () {
                    return;
                }
            };
        });