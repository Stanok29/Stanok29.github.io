/**
 * bootstraps angular onto the window.document node
 * NOTE: the ng-app attribute should not be on the index.html when using ng.bootstrap
 */
define('app', ['dom7', 'router', 'text!tpl/welcomescreen.html', 'moment', 'lang/message', 'config',
    'service/event', 'service/company', 'service/geolocation', 'service/api', 'service/share', 'service/popup',
    'service/push', 'service/cache', 'service/social', 'service/user', 'custom/info'],
        function ($$, router, tplWelcomescreen, moment, langService, config,
                hub, companyService, geolocation, api, shareService, popup, push, cache, social, userService, info) {
            'use strict';
            /*
             * place operations that need to initialize prior to app start here
             * using the `run` function on the top-level module
             */

            // Initialize your app
            var myApp = new Framework7({
                onPageAfterAnimation: router.afterAnimation,
                onPageBeforeInit: router.beforeInit,
                cache: false,
                pushState: false,
                template7Pages: true,
                'uniqueHistory': true,
                'uniqueHistoryIgnoreGetParameters': true,
                modalTitle: info.getAppName(),
                allowDuplicateUrls: false,
                imagesLazyLoadThreshold: 50,
                //modalCloseByOutside: true,
                modalTemplate: '<div class="modal {{#if class}}{{class}}{{/if}} {{#unless buttons}}modal-no-buttons{{/unless}} {{#unless dark}}modal-dark{{/unless}}">' +
                        '<div class="modal-inner">' +
                        '{{#if title_icon}}' +
                        '{{title_icon}}' +
                        '{{/if}}' +
                        '{{#if title}}' +
                        '<div class="modal-title">{{title}}</div>' +
                        '{{/if}}' +
                        '{{#if text}}' +
                        '<div class="modal-text">{{text}}</div>' +
                        '{{/if}}' +
                        '{{#if afterText}}' +
                        '{{afterText}}' +
                        '{{/if}}' +
                        '</div>' +
                        '{{#if buttons}}' +
                        '<div class="modal-buttons">' +
                        '{{#each buttons}}' +
                        '<span class="modal-button touch-fix {{#if bold}}modal-button-bold{{/if}}">{{text}}</span>' +
                        '{{/each}}' +
                        '</div>' +
                        '{{/if}}' +
                        '</div>'
            });

            var mainView = myApp.addView('.view-main', {
                // Because we use fixed-through navbar we can enable dynamic navbar
                'dynamicNavbar': true,
                'domCache': true,
                'uniqueHistory': true,
                'uniqueHistoryIgnoreGetParameters': true,
                'allowDuplicateUrls': false,
                'preroute': function (view, option) {
                    var map = info.getCustomControllerMap();
                    if (option && option.url && map[option.url]) {
                        option.url = map[option.url];
                    }

                    return true;
                }

            });

            function alertModal(icon, title, text, buttons) {
                var titleTxt = title;
                if (icon) {
                    titleTxt = '<div class="modal-alert-icon">' + icon + '</div>' + title;
                }
                myApp.modal({
                    title: titleTxt,
                    text: text,
                    buttons: buttons
                });
            }

            //пример пуш-уведомления (пока отключено)
//    $$(document).on('click', '.alert-text', function () {
//        alertModal('<i class="icon-mail-filled sprite-img"></i>', 'Шоколадный торт<br> за 10 баллов!', '<div class="alert-by"><span>Ваш Lendav Taldrik</span></div>');
//    });
            /*
             * sharing and rating
             */

            var showSuccessDialog = function (data, callbackOk, callbackCanc) {
                var makeStars = function () {
                    $$('.message-rate a').on('click', function () {
                        var stars = $$('.message-rate a');
                        var index = $$(this).index();

                        for (var i = 0; i < stars.length; i++) {
                            if (i <= index)
                            {
                                $$(stars[i]).addClass('selected').children('i').addClass('icon-star-filled').removeClass('icon-star-1');
                            }
                            else {
                                $$(stars[i]).removeClass('selected').children('i').removeClass('icon-star-filled').addClass('icon-star-1');
                            }
                        }
                    });
                };

                popup.show(popup.popups.charge, callbackOk, callbackCanc);
                $$('.popup-charge-coins').html(data.coins);

                makeStars();
            };

            var showRate = function (type, data) {
                var invokeHandler = function (isPresent) {
                    if (isPresent)
                    {
                        shareService.invokeHandler();
                    }
                    else
                    {
                        shareService.invokeHandler();
                        mainView.router.back({pageName: 'index-page', force: true, pushState: false, query: {}});
                    }
                };

                var fbModalPrepare = function (companyData) {

                    $$('.alert-done-popup .facebook-blue-icon').on('click', function () {
                        shareFacebook(companyData, function (success) {
                            companyService.sharedFb(data.companyId, function () {
                                popup.show(popup.popups.shared, function () {
                                    invokeHandler();
                                });

                                companyService.getCompany({companyId: data.companyId}, function (company) {
                                    $$('#popup-shared-coins').html(company.bonusFbShare);
                                });

                            }, function (fail) {
                                console.log('can not handle post to fb about company')
                            });
                        }, function (error) {
                            console.log('fail share fb');
                            invokeHandler();
                        });
                    });
                };

                if (type == 'present')
                {
                    if (data.first)
                        return popup.show(popup.popups.firstPresent, function () {
                            invokeHandler(true);
                        });
                    else
                        return popup.show(popup.popups.presentSuccess, function () {
                            invokeHandler(true);
                        });
                }

                showSuccessDialog({success: true, type: type, coins: data.coins}, function () {
                    var message = $$('#pupup-rate-text').val();
                    var stars = $$('.message-rate a.selected').length;

                    companyService.sendChatMessage({companyId: data.companyId, message: message, stars: stars, staffId: data.staffId}, function () {

                        if (stars > 3 && type == 'coins')
                        {
                            companyService.getDataForSharing(data.companyId, function (companyData) {
                                popup.show(popup.popups.ratePos, function () {
                                    //отказался делать шаринг
                                    invokeHandler(false);
                                });

                                fbModalPrepare(companyData);

                            }, function (noData) {
                                popup.show(popup.popups.rateNeg, function () {
                                    invokeHandler();
                                });
                            });
                        }
                        else
                            popup.show(popup.popups.rateNeg, function () {
                                invokeHandler();
                            });
                    }, function () {
                        console.log('fail send rate');
                    });
                }, function () {
                    //отказался оценивать
                    companyService.getCompany({companyId: data.companyId}, function (company) {
                        companyService.getDataForSharing(data.companyId, function (companyData) {

                            popup.show(popup.popups.shareNoRate, function () {
                                //user cancelled
                                invokeHandler(false);
                            });

                            fbModalPrepare(companyData);

                        }, function (noData) {
                            invokeHandler();
                        });
                    });
                });
            };

            var showShareDialog = function (callbackOk, callbackCanc, useTwitter) {

                alertModal('',
                        langService.get('bootstrap-4'),
                        '<div class="share-icons"><a href="#" class="fb"><i class="icon-fb sprite-img"></i></a>' + (useTwitter ? '<a href="#" class="tw"><i class="icon-tw sprite-img"></i></a>' : '') + '</div>',
                        [{text: langService.get('service-popup-13'), onClick: callbackCanc}]);

                $$('.share-icons .fb').on('click', function () {
                    shareFacebook({
                        method: 'share',
                        href: 'http://loya.mobi',
                        picture: 'http://loya.mobi/land/images/bg.jpg',
                        caption: 'Loya',
                        description: langService.get('bootstrap-5')
                    }, callbackOk, function (error) {
                        console.log('error when posting into facebook: ', error);
                    });
                });

                $$('.share-icons .tw').on('click', function () {
                    shareTwitter({
                        message: langService.get('bootstrap-5'),
                        href: 'http://loya.mobi',
                        picture: 'http://loya.mobi/land/images/bg.jpg',
                    }, callbackOk, function (err) {
                        console.log('fail post to tw', err);
                    });
                });
            };

            var shareTwitter = function (data, callback, error) {
                window.plugins.socialsharing.shareViaTwitter(data.message, data.picture, data.href, callback, error);
            };

            var shareFacebook = function (data, callback, error) {
                var showDialog = function () {

                    /*
                     * fb надо, чтобы первый запрос упал с нехваткой прав, тогда на второй (нужный нам) придет 
                     */
                    social.fb.api('me/dirtyHack',
                            ['publish_pages', 'manage_pages', 'publish_actions'],
                            function (res)
                            {
                                console.log('yeah', res);
                            },
                            function (err)
                            {
                                console.log('fail', err);
                            });

                    /*
                     * Другой вариант (опасно тем, что права у нас вдруг могут как-то быть получены при авторизации, тогда запрос может пройти):
                     */
//                            'me/feed?method=post&message=testMessage&link=impalz.co/JMR3a&picture=www.impalz.com/images/affiliate-1.jpg&caption=\n\
//New Product&description=we would love to know your feedback&access_token=' + token,
//                                [],
                    social.fb.showDialog(data, function (result) {
                        //если юзер отменет диалог, то мы тоже попадем сюда, тогда
                        //result.completionGesture = 'cancel'
                        if (result.completionGesture != 'cancel')
                        {
                            console.log('fb share callback');
                            myApp.closeModal($$('.modal'));
                            callback && callback(result);
                        }
                        else
                        {
                            error && error();
                        }

                    }, function (err) {
                        error && error(err);
                    });
                };

                social.fb.getStatus(function (logged) {
                    showDialog();
                }, function (off) {
                    social.fb.login(function (login) {
                        showDialog();
                    }, function (err) {
                        console.log('login error', err);
                    });
                });
            };

            var sharing = {
                showShareDialog: showShareDialog,
                facebook: shareFacebook
            };

            $$(document).on('click', '#index-share-loya', function () {
                window.plugins.socialsharing.canShareVia('twitter', 'message', null, null, null, function (ok) {
                    showShareDialog(function (res) {
                        console.log('posted!', res);
                        myApp.closeModal();

                    }, function (err) {

                    }, true);
                }, function (err) {
                    showShareDialog(function (res) {
                        console.log('posted!', res);
                        myApp.closeModal();
                    }, function (err) {

                    }, false);
                });

            });

            hub.on('companies', 'addCoins', function (data) {
                if (!data.rate)
                    return;

                showRate('coins', {companyId: data.companyId, coins: data.coins, staffId: data.staffId});
            });

            hub.on('companies', 'removeCoins', function (data) {
                if (!data.rate)
                    return;

                showRate('present', {companyId: data.companyId, staffId: data.staffId});
            });

            /* 
             * Welcome screen 
             */


            var getWelcomeOptions = function () {
                var options = {
                    'bgcolor': '#000',
                    'fontcolor': '#fff',
                    'closeButtonText': '{{lang "bootstrap-6"}}', // langService.get('bootstrap-6'),
                    'preloadImages': false,
                    'buttons': true,
                    'template': tplWelcomescreen,
                    'pagination': true,
                    'closeButton': info.allowSkipOnWelcome()
                }

                var toReturn = JSON.parse(JSON.stringify(options));
                toReturn.closeButtonText = Template7.compile(toReturn.closeButtonText)();
                return toReturn;
            };

            var getWelcomeSlides = function () {
                var welcomescreen_slides = info.getWelcomScreenSlides();

                var toReturn = JSON.parse(JSON.stringify(welcomescreen_slides));
                $$.each(toReturn, function (i, item) {
                    item.text = Template7.compile(item.text)();
                });

                return toReturn;
            };



            var welcomeScreen = null;
            myApp.showWelcomeScreen = function () {
                welcomeScreen = myApp.welcomescreen(getWelcomeSlides(), getWelcomeOptions());
                console.log('welcome');
                /*
                 * чтоб не моргал основной экран при загрузке приложения мы его скрыли в css
                 * .views - display:none
                 * поэтому, после того, как welcome отобразился, .views надо показать обратно
                 */
                $$('.welcomescreen-container').css('opacity', 1);
            };

            myApp.closeWelcomeScreen = function () {
                if (welcomeScreen)
                    welcomeScreen.close();
            };

            /*
             * Template7 helpers
             */
            Template7.registerHelper('date', function (date, options) {
                var date = moment(date);
                var now = moment();
                if (date.dayOfYear() == now.dayOfYear() && date.year() == now.year()) {
                    return date.format('HH:mm');
                }

                if (options.hash.format == 'chat')
                    return date.format('HH:mm DD.MM.YYYY');

                return date.format('DD.MM.YYYY');

            });

            Template7.registerHelper('substring', function (message, options) {
                var maxLen = 150;

                if (options.hash.length)
                    maxLen = parseInt(options.hash.length);

                var parts = message.split(/\s+/);
                var newMessage = '';
                var i = 0;
                var l = 0;

                while (l < maxLen && i < parts.length) {
                    newMessage += parts[i] + ' ';
                    l = newMessage.length;

                    i++;
                }

                newMessage = newMessage.trim();

                return newMessage;

            });


            Template7.registerHelper('for', function (i, options) {
                var start = options.hash.start != undefined ? parseInt(options.hash.start) : false;
                var end = options.hash.end != undefined ? parseInt(options.hash.end) : false;
                i = parseInt(i);

                var html = options.fn(this);
                var n = (start !== false ? i : end - i);

                var ret = '';
                for (var j = 0; j < n; j++)
                    ret = ret + html;

                return ret;
            });


            Template7.registerHelper('round', function (number, options) {
                return Number(number).toFixed(options.hash.count);
            });

            Template7.registerHelper('money', function (number, options) {
                return Number(number).money(options.hash.digits);
            });

            /*
             * name - название фрагмента
             */
            Template7.registerHelper('lang', function (name, options) {
                var data = langService.get(name);

                if (typeof data == 'function')
                    return data(options.hash.option);

                //вложенные шаблоны
                var template = Template7.compile(data);
                return template(this);
            });

            String.prototype.notags = function (allowed) {
                var input = this;
                allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')

                var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
                var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

                return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
                })
            }


            Number.prototype.money = function (digits) {
                digits = digits ? digits : 2;

                if ((100 * this) % 100 < 1) {
                    digits = 0;
                }

                return this.toFixed(digits).replace(/./g, function (c, i, a) {
                    return i && c !== "." && ((a.length - i) % 3 === 0) ? ' ' + c : c;
                });
            }

            /*
             * disable android backbutton
             */
            document.addEventListener('backbutton', function (e) {
                e.preventDefault();

                var backhint = $$('.navbar-on-center .back-hint');
                if (backhint.length > 0)
                    return backhint.click();

                $$('.navbar-on-center .back').click();


            }, false);

            $$(document).on('touchstart', '.touch-fix, .actions-modal-button', function (e) {
                //lang's setting is not fixable now

                e.preventDefault();
                $$(this).click();
                $$(this).removeClass('active-state');
            });

            $$(document).on('click', '.alert-email', function () {
                popup.show(popup.popups.email);
            });

            /*
             * pushes
             * 
             */
            if (config.mobile)
            {
                push.init();
            }

            /*
             * api error handler
             */
            api.setInternetErrorHandler(function () {
                mainView.router.load({url: 'error.html', query: {error: langService.get('internetError')}});
            });

            api.setTokenErrorHandler(function () {
                userService.logout(mainView.loadPage('auth.html'));
            });
            api.setCommonErrorHandler(function (d) {
                myApp.alert(langService.get(d.error));
            });

            /*
             * gelolocation
             */
            geolocation.init();

            /*
             * Popups
             */
            popup.init(function (pop, okHandler, cancelHandler) {
                var buttons = [];

                for (var i = 0; i < pop.buttons.length; i++)
                {
                    var popButton = pop.buttons[i];

                    var button = {
                        text: popButton.text,
                        onClick: popButton.ok ? function () {
                            popButton.onClick && popButton.onClick();
                            okHandler && okHandler();
                        } : function () {
                            cancelHandler && cancelHandler();
                        }
                    };

                    buttons.push(button);
                }

                myApp.modal({
                    title: pop.title,
                    class: pop.class,
                    text: pop.text,
                    buttons: buttons,
                    title_icon: pop.title_icon
                });
            });

            cache.init();



            return {
                'f7': myApp,
                'view': mainView,
                'langService': langService,
                'share': sharing
            };
        });


