define(['service/storage', 'config', 'service/event', 'service/api', 'service/geolocation', 'lang/message'], function (storage, config, hub, api, geolocation, langService) {
    'use strict';

    var getCompaniesPrivate = function (filterContext, callback, error)
    {
        storage.companies.data(function (companies) {
            var result = companies.slice();

            if (filterContext.onlyJoined)
                result = result.filter(function (item) {
                    return item.joined;
                });

            if (filterContext.query)
            {
                var reg = new RegExp(filterContext.query, 'i');
                result = result.filter(function (item) {
                    return reg.test(item.name);
                });
            }

            result = result.map(function (item) {
                item.place = geolocation.getDistanceFromMe(item.locations);
                item.place.distance = Math.round(item.place.distance);
                return item;
            });

            if (filterContext.sortBy === 'distance')
            {
                result = result.sort(function (a, b) {
                    if (a.place.distance < b.place.distance)
                        return -1;
                    else if (a.place.distance > b.place.distance)
                        return 1;
                    else
                        return 0;
                });
            }

            if (filterContext.sortBy === 'name')
            {
                //todo: посмотреть на произвоидтельность

                var nearest = result.filter(function (item) {
                    return item.place.distance <= config.loyalityDistance; //100km
                });

                var others = result.filter(function (item) {
                    return item.place.distance > config.loyalityDistance; //100km
                });

                nearest = nearest.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();

                    return (a < b) ? -1 : 1;
                });

                others = others.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();

                    return (a < b) ? -1 : 1;
                });

                var result = nearest.concat(others);
            }

            if (filterContext.page != undefined)
            {
                var step = 5;
                var begin = filterContext.page * step;

                result = result.slice(begin, begin + step);


            }

            callback(result);
        }, error);
    };

    var updateTypes = {
        newPresent: 0,
        firstPresent: 1,
        removeCoins: 2,
        addCoins: 3,
        newCompany: 4,
        joinOrLeave: 5,
        availablePresents: 6,
        shared: 7
    };
    var triggerUpdate = function (data)
    {
        hub.trigger('company', 'update', data);
    };

    var calculate = function (companyId) {
        companyService.getCompany({companyId: companyId}, function (company) {
            var coins = company.coins;
            companyService.getPresents(companyId, function (presents) {
                var count = 0;
                for (var i = 0; i < presents.length; i++)
                    if (presents[i].cost <= coins)
                        count++;

                company.allowedPresentsCount = count;
                storage.companies.save(null, function () {
                    triggerUpdate({count: count, type: updateTypes.availablePresents, companyId: companyId});
                });
            });
        });
    };

    var handlePresents = function (presents, companyId, callback, error)
    {
        companyService.getCompany({companyId: companyId}, function (company) {
            for (var i = 0; i < presents.length; i++)
            {
                if (presents[i].img)
                    presents[i].imgJs = config.domain + "img/get/" + presents[i].img + "/" + company.login + "?width=600&height=336&crop=1&resize=1";
                else
                    presents[i].imgJs = './img/gift_def.png';

                if (company.coins < presents[i].cost)
                {
                    presents[i].progress = company.coins / presents[i].cost * 100;

                    if (!presents[i].progress)
                        presents[i].progress = 0.1;
                }
                else
                    delete presents[i].progress;
            }

            callback(presents);
        }, error);
    };

    var companyService = {
        getCompanies: function (filterContext, callback, error)
        {
            getCompaniesPrivate(filterContext, callback, error);
        },
        getCompany: function (data, callback, error)
        {
            getCompaniesPrivate({}, function (result) {
                result = result.filter(function (company) {
                    return company.id == data.companyId;
                });

                if (result.length > 0)
                {
                    result[0].place = geolocation.getDistanceFromMe(result[0].locations);
                    result[0].place.distance = Math.round(result[0].place.distance);
                    callback(result[0]);
                }
                else
                    error();

            }, error);
        },
        getPresents: function (companyId, callback, error)
        {
            storage.presents.data(companyId, function (result) {
                handlePresents(result, companyId, callback, error);
            }, error);
        },
        constructImage: function (data, callback, error)
        {
            companyService.getCompany({companyId: data.companyId}, function (company) {
                if (data.img)
                {
                    var img = config.domain + "img/get/" + data.img + "/" + company.login;
                    if (data.width && data.height)
                        img += '?width=' + data.width + '&height=' + data.height + '&crop=1&resize=1'

                    callback(img);
                }
                else
                    callback('./img/gift_def.png');
            });
        },
        getPresent: function (data, callback, error) {
            if (data.fromServer)
                return api.getPresent(data, function (present) {
                    handlePresents([present], data.companyId, function (presents) {
                        callback(present);
                    }, error);
                });

            else
                return this.getPresents(data.companyId, function (presents) {
                    var res = presents.filter(function (elem) {
                        return elem.id == data.presentId;
                    });

                    if (res.length > 0)
                        return callback(res[0]);

                    error && error();
                }, error);
        },
        leaveCompany: function (companyId, cb, err) {
            var self = this;

            api.leaveCompany({companyId: companyId}, function (result) {
                self.getCompany({companyId: companyId}, function (result) {
                    result.joined = false;
                    result.coins = 0;
                    storage.companies.save(null, function () {
                        cb(result);
                        triggerUpdate({joined: false, companyId: result.id, type: updateTypes.joinOrLeave});
                    });
                });
            }, err);
        },
        getChat: function (data, cb, err) {
            var self = this;
            self.getCompany({companyId: data.companyId}, function (company) {
                api.getChat(data, function (result) {
                    for (var i = 0; i < result.messages.length; i++)
                    {
                        if (!result.messages[i].my)
                            result.messages[i].imgLogo = company.imgLogo;
                    }

                    result.messages = result.messages.sort(function (a, b) {
                        return (a.date < b.date ? -1 : 1);
                    });

                    cb(result);
                }, err);
            });
        },
        sendChatMessage: function (data, cb, err)
        {
            api.sendChatMessage(data, cb, err);
        },
        disablePush: function (companyId, cb, err)
        {
            api.disablePush({companyId: companyId}, function () {
                companyService.getCompany({companyId: companyId}, function (company) {
                    company.subscribed = false;
                    storage.companies.save();
                    cb && cb();
                });
            }, err);
        },
        enablePush: function (companyId, cb, err)
        {
            api.enablePush({companyId: companyId}, function () {
                companyService.getCompany({companyId: companyId}, function (company) {
                    company.subscribed = true;
                    storage.companies.save();
                    cb && cb();
                });
            }, err);
        },
        sharedFb: function (companyId, cb, err)
        {
            api.sharedFb({companyId: companyId}, function (result) {
                companyService.getCompany({companyId: companyId}, function (company) {
                    company.coins = Number(company.coins) + Number(company.bonusFbShare);
                    company.bonusedFb = true;
                    storage.companies.save(null, function () {

                        var data = {};
                        data.type = updateTypes.addCoins;
                        data.companyCoins = company.coins;
                        data.companyId = companyId;
                        triggerUpdate(data);
                    });
                });

                cb && cb(result);
            }, err);
        },
        getDataForSharing: function (companyId, cb, err)
        {
            companyService.getCompany({companyId: companyId}, function (company) {
                if (company.bonusedFb)
                    return err && err();

                api.getFirstImg({companyId: companyId}, function (img) {
                    cb({method: 'share',
                        href: 'http://' + company.login + '.loya.mobi',
                        picture: 'http://loya.mobi/img/get/' + img + '/' + company.login,
                        caption: 'Loya',
                        description: langService.get('service-company-0') + ' ' + company.name});
                }, function (err) {
                    console.log('cant get first img', err);
                    err && err();
                });
            }, err);
        },
        updateTypes: updateTypes
    };

    hub.on('companies', 'addToFavorite', function (data) {
        companyService.getCompany({companyId: data.companyId}, function (result) {
            result.joined = true;
            result.subscribed = true;
            storage.companies.save(null, function () {
                data.type = updateTypes.joinOrLeave;
                data.joined = true;
                triggerUpdate(data);
                calculate(data.companyId);

            });
        });
    });

    hub.on('companies', 'new', function (data) {
        storage.companies.updateFromServer(function () {
            data.type = updateTypes.newCompany;
            triggerUpdate(data);
            calculate(data.companyId);

        });
    });

    hub.on('companies', 'addCoins', function (data) {
        companyService.getCompany({companyId: data.companyId}, function (company) {
            company.coins = Number(company.coins) + Number(data.coins);
            storage.companies.save(null, function () {
                data.type = updateTypes.addCoins;
                data.companyCoins = company.coins;
                triggerUpdate(data);
                calculate(data.companyId);

            });
        });
    });

    hub.on('companies', 'removeCoins', function (data) {
        if (data.coins == 0)
            storage.presents._load(data.companyId, function (result) {
                data.type = updateTypes.firstPresent;
                triggerUpdate(data);
                calculate(data.companyId);

            });

        else
        {
            companyService.getCompany({companyId: data.companyId}, function (company) {
                company.coins = Number(company.coins) - Number(data.coins);
                data.type = updateTypes.removeCoins;
                data.companyCoins = company.coins;
                triggerUpdate(data);
                calculate(data.companyId);

            });
        }
    });

    hub.on('companies', 'newPresent', function (data) {
        storage.presents._load(data.companyId, function (result) {
            data.type = updateTypes.newPresent;
            triggerUpdate(data);
            calculate(data.companyId);
        });
    });



    return companyService;
});
