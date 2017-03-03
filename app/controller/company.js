define(['app', 'text!tpl/presents.html', 'dom7', 'service/user', 'service/event', 'service/company', 'service/notify', 'config', 'service/popup', 'service/cache', 'service/geolocation', 'custom/info'],
        function (app, tpl, $$, userService, hub, companyService, notificationService, config, popup, cache, geolocation, customInfo) {
            'use strict';

            var tplPresents = Template7.compile(tpl);
            var presents = [];
            var companyId;
            var company = null;

            var store = $$.createStore();

            var loader = {
                active: false,
                enable: function () {
                    $$('.infinite-scroll-preloader').show();
                    this.active = true;
                },
                disable: function () {
                    $$('.infinite-scroll-preloader').hide();
                    this.active = false;
                }
            };

            var renderCompany = function () {
                $$('#company-header-name').html(company.name);

                if (company.place.distance <= 1000)
                    $$('#company-detail-distance').html(company.place.distance + ' ' + app.langService.get('controller-company-0'));
                else if (company.place.distance > 1000)
                    $$('#company-detail-distance').html((company.place.distance / 1000).toFixed(1) + ' ' + app.langService.get('controller-company-5'));

                setAvailablePresents(company.allowedPresentsCount);
                setCoins(company.coins, true);

                $$('#company-detail-image').attr('data-pre-src', company.imgMainScreen);
                cache.useRightImage($$('#company-detail-image'));

                $$('#company-detail-heart i').attr('class', (company.joined ? 'icon-heart-filled sprite-img' : 'icon-heart sprite-img'));

                var address = (company.place.location && company.place.location.shortName) ? company.place.location.shortName : 'company.place.location.city';
                $$('#company-detail-address').html(address);
                //gmaps
                geolocation.buildMap(document.getElementById('company-detail-map'), company.locations);

                $$('#company-detail').show();



                var messageCount = notificationService.getMessageCount(company.id);
                if (messageCount)
                {
                    $$('#company-messages-count').html(messageCount);
                    $$('#company-messages-count').show();
                }
                else
                {
                    $$('#company-messages-count').hide();
                    $$('#company-messages-count').html(messageCount);
                }

                if (!config.demo)
                    $$('#company-links-chat').attr('href', 'chat.html?cid=' + companyId);

                if (!company.joined)
                    changeMenuVisibility(false);
                else
                    changeMenuVisibility(true);

                $$('#company-detail-action').hide();
                company.facebook ? $$('#company-detail-fb').css('display', 'inline-block') : $$('#company-detail-fb').hide();
                company.bookLink ? $$('#company-detail-book').css('display', 'inline-block') : $$('#company-detail-book').hide();
                if (customInfo.getCustomBookController()) {
                    $$('#company-detail-book').css('display', 'inline-block');
                }
                company.vk ? $$('#company-detail-vk').css('display', 'inline-block') : $$('#company-detail-vk').hide();
                company.insta ? $$('#company-detail-insta').css('display', 'inline-block') : $$('#company-detail-insta').hide();
                company.website ? $$('#company-detail-www').css('display', 'inline-block') : $$('#company-detail-www').hide();

                if (company.phone) {
                    $$('#company-detail-call').css('display', 'inline-block');
                    $$('#company-detail-call').attr('href', 'tel:' + company.phone);
                }
                else
                    $$('#company-detail-call').hide();

                if (company.facebook || company.bookLink || company.phone || company.vk || company.insta)
                    $$('#company-detail-action').show();
            };

            var changeMenuVisibility = function (show)
            {
                var menu = $$('[data-page="company"] .navbar-on-center .right');
                if (show)
                    menu.css('display', '');
                else
                    menu.css('display', 'none');
            };

            var renderPresents = function () {
                var html = tplPresents({presents: presents, companyId: companyId});
                $$('#company-presents-list').append(html);

                var firstPresent = $$('[data-first=true]');

                var presentsToRender = $$('#company-presents-list .object-detail-action');

                var setActiveState = function (div)
                {
                    setTimeout(function () {
                        div.addClass('active-state');

                        setTimeout(function () {
                            div.removeClass('active-state');
                        }, 0);
                    }, 0);


                };

                $$.each(presentsToRender, function (index, item) {
                    item = $$(item);

                    if (config.demo && item.attr('data-pid'))
                        item.on('click', function () {
                            setActiveState(item);
                            popup.show(popup.popups.firstPresentClickDemo, function () {
                                userService.setDemoData({type: 'present', data: {cid: companyId, pid: item.attr('data-pid')}});
                                app.view.router.loadPage('registration.html');
                            });
                        });

                    else if (item.attr('data-pid'))
                        item.on('click', function () {
                            setActiveState(item);

                            app.view.router.load({url: 'present.html', query: {pid: item.attr('data-pid'), cid: companyId}});
                        });
                    else
                        item.on('click', function () {
                            setActiveState(item);
                            popup.show(popup.popups.unavailabePresent);
                        });
                });

                $$('#company-presents-list img').each(function (i, item) {
                    cache.useRightImage($$(item));
                });
            };

            var changeHeart = function (joined) {
                var target = $$('#company-detail-heart');
                if (joined)
                    target.children('i').attr('class', 'icon-heart-filled sprite-img');
                else
                    target.children('i').attr('class', 'icon-heart sprite-img');
            };

            var loadPresents = function (clean) {
                if (loader.active)
                    return;

                //var share = $$('#company-share');
                //share.insertBefore($$('#company-presents-list'));

                if (clean)
                    $$('#company-presents-list').html('');

                loader.enable();

                companyService.getPresents(companyId, function (result) {
                    presents = result.map(function (item) {
                        item.name = item['name_' + app.langService.language()];
                        return item;
                    });
                    renderPresents();
                    loader.disable();
                }.cb(store), function () {
                    loader.disable();
                }.cb(store));
            };

            var leaveCompany = function () {
                companyService.leaveCompany(companyId, function (result) {
                    app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {}});
                }.cb(store));
                return;
            };

            var changeSubscription = function () {
                if (company.subscribed)
                    companyService.disablePush(company.id);

                else
                    companyService.enablePush(company.id);
            };

            $$(document).on('click', '#company-header-menu', function () {
                var buttons = [{
                        text: company.subscribed ? app.langService.get('controller-company-1') : app.langService.get('controller-company-2'),
                        onClick: function () {
                            changeSubscription();
                        }
                    },
                    {
                        text: 'Удалить',
                        onClick: function () {

                            app.f7.modal({text: app.langService.get('controller-company-3'), buttons: [
                                    {text: app.langService.get('service-popup-4'), onClick: function () {
                                            leaveCompany();

                                        }},
                                    {text: app.langService.get('service-popup-13')}
                                ]});
                        }
                    },
                    {
                        text: app.langService.get('controller-company-4')
                    }];

                app.f7.actions(buttons);
            });

            var enableListeners = function () {
                hub.on('company', 'update', function (info) {
                    if (info.companyId != company.id)
                        return;

                    switch (info.type)
                    {
                        case companyService.updateTypes.joinOrLeave:
                            changeHeart(info.joined);
                            changeMenuVisibility(info.joined);
                            break;

                        case companyService.updateTypes.newPresent:
                        case companyService.updateTypes.firstPresent:
                            loadPresents(true);
                            break;

                        case companyService.updateTypes.removeCoins:
                            setCoins(info.companyCoins);
                            break;

                        case companyService.updateTypes.addCoins:
                            setCoins(info.companyCoins);
                            break;

                        case companyService.updateTypes.availablePresents:
                            setAvailablePresents(info.count);
                            break;
                    }
                });



                $$(document).on('click', '#company-back', function () {
                    app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {}});
                });

                $$(document).on('click', '#company-detail-fb', function () {

                    //cordova.InAppBrowser.open(company.facebook, '_blank', 'location=yes');
                    window.open(company.facebook, '_system');
                });

                $$(document).on('click', '#company-detail-book', function () {
                    var customController = customInfo.getCustomBookController();
                    if (customController) {
                        app.view.router.load({url: customController});
                    } else {
                        window.open(company.bookLink, '_system');
                    }
                });
                $$(document).on('click', '#company-detail-insta', function () {
                    window.open(company.insta, '_system');
                });
                $$(document).on('click', '#company-detail-vk', function () {
                    window.open(company.vk, '_system');
                });
                $$(document).on('click', '#company-detail-www', function () {
                    window.open(company.website, '_system');
                });
                $$(document).on('click', '#company-detail-call', function () {
                    window.open('tel:' + company.phone, '_system');
                });

            };

            var setCoins = function (coins, supressRender) {
                $$('#company-detail-coins').html(coins);


                if (!supressRender)
                    loadPresents(true);//recalculate prsents's progress
            };

            var setAvailablePresents = function (count)
            {
                $$('#company-detail-presents').html(count);
            };

            enableListeners();

            return {
                'init': function (page) {

                    store.reset();
                    loader.disable();

                    presents = [];
                    company = null;

                    companyId = customInfo.getCompanyId();

                    companyService.getCompany({companyId: companyId}, function (result) {
                        company = result;

                        renderCompany();
                        loadPresents(true);
                    }.cb(store));

                    popup.show(popup.popups.firstCompanyClick);

                    app.view.params.swipeBackPage = false;


                    var demoData = page.query.data;
                    if (demoData && demoData.type == 'present')
                        //проверяем, что подарок существует и доступен
                        companyService.getPresent({presentId: demoData.data.pid, companyId: demoData.data.cid, fromServer: false}, function (ok) {
                            if (ok && !ok.progress)
                                app.view.router.load({url: 'present.html', query: demoData.data, animatePages: false});

                            page.query.data = null;
                        }.cb(store));
                },
                'infinite': function () {

                }
            };
        });