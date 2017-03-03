define(['app', 'dom7', 'service/user', 'service/company', 'service/event', 'service/cache'], function (app, $$, userService, companyService, hub, cache) {
    'use strict';

    var factory = function (onlyJoined, tpl, tabName) {
        var store = $$.createStore();

        var loader = {};
        var companies = [];

        var sortTypes = {
            distance: 'distance',
            name: 'name'
        };

        var filterContext = {
            query: '',
            sortBy: sortTypes.distance,
            sort: 1,
            onlyJoined: onlyJoined,
            page: 0,
            limit: 10,
        };



        var tplCompanies = Template7.compile(tpl);
        var render = function (clean) {
            var html = tplCompanies({'companies': companies});

            $$('#index-' + tabName + '-list').append(html);
            $$('.favorite-list .favorite-item').each(function (i, item) {
                item = $$(item);
                //item.on('click', function () {
                  //  app.view.router.loadPage('company.html?cid=' + item.attr('data-company'));
                //});
            });

            $$('#index-' + tabName + '-list img').each(function (i, item) {
                cache.useRightImage($$(item));
            });
        };



        var changeHeart = function (companyId, joined) {
            var target = $$('[data-company="' + companyId + '"] .companies-company-heart');
            if (joined)
            {
                target.attr('data-joined', 'true');
                target.children('i').attr('class', 'icon-heart-filled sprite-img');
            }
            else
            {
                target.attr('data-joined', 'false');
                target.children('i').attr('class', 'icon-heart sprite-img');
            }
        };

        var loadCompanies = function (clean, enableMock) {
            if (loader.active)
                return;

            filterContext.query = $$('#index-' + tabName + '-query').val();

            loader.enable();

            if (clean)
                $$('#index-' + tabName + '-list').html('');

            if (clean)
                filterContext.page = 0;

            companyService.getCompanies(filterContext, function (result) {
                loader.disable();
                if (result.length == 0)
                {
                    if (enableMock)
                    {
                        $$('#index-favorite-mock').css('display', '');
                        $$('#index-favorite-control').css('display', 'none');
                    }

                    return;
                    //тут при желании можно отключать загрузку вообще
                }
                else
                {
                    $$('#index-favorite-mock').css('display', 'none');
                    $$('#index-favorite-control').css('display', '');
                }

                filterContext.page++;

                companies = result;
                render(clean);
            }.cb(store), function (error) {
                loader.disable();
            }.cb(store));

        };

        var changeSort = function (sortBy) {
            var tabId = onlyJoined ? '#tab2' : '#tab1';

            switch (sortBy) {
                case sortTypes.distance:
                    $$(tabId + ' .filter-sort-link label').html(' ' + app.langService.get('controller-list-companies-0'));
                    filterContext.sortBy = sortBy;
                    loadCompanies(true);
                    break;
                case sortTypes.name:
                    var elem = $$(tabId + ' .filter-sort-link label');
                    elem.html(' ' + app.langService.get('controller-list-companies-1'));
                    filterContext.sortBy = sortBy;
                    loadCompanies(true);
                    break;
            }
        };

        var sortClick = function () {
            var buttons = [{
                    text: '<label data-sort=' + sortTypes.distance + '>' + app.langService.get('controller-list-companies-2') + '<label/>',
                    onClick: function () {
                        changeSort(sortTypes.distance);
                    }
                },
                {
                    text: '<label data-sort=' + sortTypes.name + '>' + app.langService.get('controller-list-companies-3') + '<label/>',
                    onClick: function () {
                        changeSort(sortTypes.name);
                    }
                },
                {
                    text: app.langService.get('controller-list-companies-4')
                }];

            app.f7.actions(buttons);

            $$('label[data-sort=' + filterContext.sortBy + ']').parent().addClass('selected');
        };

        var tabId = onlyJoined ? '#tab2' : '#tab1';

        $$(document).on('click', tabId + ' .filter-sort-link-outer', sortClick);

        var search = function () {
            filterContext.page = 0;
            loadCompanies(true);
            return false;
        };

        $$(document).on('click', '#index-' + tabName + '-search', search);
        $$(document).on('search', '#index-' + tabName + '-query', search);

        var setCoins = function (companyId, coins)
        {
            $$('[data-company="' + companyId + '"] .coins-label').html(coins);
        };

        var setAvailablePresents = function (companyId, count)
        {
            $$('[data-company="' + companyId + '"] .allowed-label').html(count);
        };

        var enableListeners = function () {
            //todo: возможно, при отписке надо компанию динамически удалять из favs

            hub.on('company', 'update', function (data) {
                switch (data.type)
                {
                    case companyService.updateTypes.joinOrLeave:
                        changeHeart(data.companyId, data.joined);
                        break;

                    case companyService.updateTypes.addCoins:
                        setCoins(data.companyId, data.companyCoins);
                        break;

                    case companyService.updateTypes.removeCoins:
                        setCoins(data.companyId, data.companyCoins);
                        break;

                    case companyService.updateTypes.availablePresents:
                        setAvailablePresents(data.companyId, data.count);
                        break;
                }
            });
        };

        enableListeners();

        return {
            'infinite': function () {
//                filterContext.page++;
                loadCompanies();
            },
            'init': function () {
                store.reset();
                loader = this.loader;
                filterContext.page = 0;
                loadCompanies(true, true);
            }
        };
    };

    return factory;
});