define(['app',
    'controller/company', 'controller/index-delivery', 'controller/chat', 'controller/index-notifications', 'controller/index-settings',
    'dom7', 'service/event', 'service/notify', 'service/popup', 'custom/info', 'service/company'],
        function (app,
                tab1, tab2, tab3, tab4, tab5,
                $$, hub, notify, popup, customInfo, companyService) {
            'use strict';

            var page = {};
            var tabs = {};
            var currentTab = {};
            tabs[1] = tab1;
            tabs[2] = tab2;
            tabs[3] = tab3;
            tabs[4] = tab4;
            tabs[5] = tab5;

            var store = $$.createStore();


            var base = {
                loader: {
                    active: false,
                    enable: function () {
                        $$('.infinite-scroll-preloader').css('opacity', 0.9);
                        this.active = true;
                    },
                    disable: function () {
                        $$('.infinite-scroll-preloader').css('opacity', 0);
                        this.active = false;
                    }

                }
            };

            var activate = function (index, force) {
                if (force)
                {
                    app.f7.showTab('#tab' + index);
                }

                base.loader.disable();
                currentTab = tabs[index];
                currentTab.init(page);

                index === 3 ? $$('#idnex-chat-messagebar').removeClass('none') : $$('#idnex-chat-messagebar').addClass('none');
                if (index !== 2)
                    $$('#delivery-basket').addClass('none');
            };

            for (var i in tabs)
                $$.extend(tabs[i], base);



            $$(document).on('show', '#tab1', function (e) {
                activate(1);
                $$('#index-qr-button').show();
            });

            $$(document).on('show', '#tab2', function (e) {
                activate(2);
                $$('#index-qr-button').hide();
            });

            $$(document).on('show', '#tab3', function (e) {
                activate(3);
                $$('#index-qr-button').hide();
            });
            $$(document).on('show', '#tab4', function (e) {
                activate(4);
                $$('#index-qr-button').show();
            });
            $$(document).on('show', '#tab5', function (e) {
                activate(5);
                $$('#index-qr-button').hide();
            });


            $$(document).on('infinite', '#index-page.infinite-scroll', function () {
                base.loader.disable();
                currentTab.infinite();
            });

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


            var render = function () {
                setMessageCount(notify.getMessageCount());
                setNotificationCount(notify.getNotificationsCount());

                getCompany(function (c) {
                    if (!c.catalogModeEnabled) {
                        $$('#index-page-menu-tab2').hide();
                    } else {
                        $$('#index-page-menu-tab2').css('display', 'flex');
                    }

                    $$('#index-page-menu a').css('opacity', 1);
                });
            };

            var setNotificationCount = function (count) {
                if (count) {
                    $$('#index-navbar-notify').text(count);
                    $$('#index-navbar-notify').show();
                }
                else
                    $$('#index-navbar-notify').hide();
            };

            var setMessageCount = function (count) {
                if (count) {
                    $$('#index-navbar-chat').text(count);
                    $$('#index-navbar-chat').show();
                }
                else
                    $$('#index-navbar-chat').hide();
            };

            var enableListeners = function () {

                hub.on('chat', 'changeCount', function (info) {
                    setMessageCount(info.count);
                });

                hub.on('notification', 'changeCount', function (info) {
                    setNotificationCount(info.count);
                });
            };

            enableListeners();

            return {
                'init': function (p) {
                    store.reset();

                    if (p.query && p.query.noload)
                        return;

                    page = p;

                    render();

                    var pageId = 1;
                    var force = false;
                    if (p.query.pageId)
                    {
                        pageId = p.query.pageId;
                        force = true;
                    }

                    activate(pageId, force);

                    popup.show(popup.popups.firstLogin);

                    app.view.params.swipeBackPage = false;

                }
            };
        });