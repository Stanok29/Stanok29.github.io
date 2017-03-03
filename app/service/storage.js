define(['service/api', 'config'], function (api, config) {
    'use strict';

    var companies = null;
    var presents = null;
    var user = null;
    var popups = null;
    var lang = null;

    var demoData = null;

    var db = {
        'load': function (key, callback) {
            var json = localStorage[key];
            if (json === undefined)
                callback(json);
            else
                callback(JSON.parse(json));
        },
        'save': function (key, value, callback) {
            if (!config.demo || key == 'lang')
                localStorage[key] = JSON.stringify(value);
            callback && callback();
        }
    };

    var companyStorage = {
        updateFromServer: function (callback, error)
        {
            api.findCompanies({}, function (res) {
                companies = {companies: res, expire: Date.now() + 1000 * 5};//1 min
                db.save('companies', companies);
                callback && callback(companies.companies);
            }, error);
        },
        'data': function (callback, error) {

            if (companies === null || companies.expire < Date.now())
                return db.load('companies', function (res) {
                    if (res === undefined || res.expire < Date.now())
                        return companyStorage.updateFromServer(callback, error);
                    companies = res;
                    callback(companies.companies);
                });

            callback(companies.companies);
        },
        'save': function (items, callback) {
            if (items)
                companies.companies = items;

            db.save('companies', companies, callback);
        }
    };

    var presentsStorage = {
        '_load': function (companyId, callback, error) {
            api.getPresents({companyId: companyId}, function (res) {
                if (!presents)
                    presents = {};

                presents[companyId] = {presents: res, expire: Date.now() + 60 * 20 * 1000}; // 20 mins
                db.save('presents', presents);
                callback(res);
            }, error);
        },
        'data': function (companyId, callback, error) {

            if (presents === null)
                return db.load('presents', function (res) {
                    if (res === undefined || res[companyId] === undefined || res[companyId].expire < Date.now())
                        return presentsStorage._load(companyId, callback, error);

                    presents = res;
                    callback(presents[companyId].presents);
                });

            if (presents[companyId] === undefined || presents[companyId].expire < Date.now())
                return presentsStorage._load(companyId, callback, error);

            callback(presents[companyId].presents);
        },
        'save': function (callback) {
            db.save('presents', presents, callback);
        }
    };

    var userStorage = {
        'data': function (callback, error) {
            if (user === null)
                return db.load('user', function (result) {
                    if (!result && error)
                        return error();

                    else if (result)
                    {
                        user = result;
                        callback(user);
                    }
                });

            callback(user);
        },
        'save': function (userToSave, callback) {
            user = userToSave;
            db.save('user', user, callback);
        }
    };

    var popupsStorage = {
        'data': function (callback, error)
        {
            userStorage.data(function (usr) {
                var key = usr.currentUser.id;

                if (popups === null)
                    return db.load('popups', function (result) {
                        if (result === undefined || result[key] === undefined)
                        {
                            if (result === undefined)
                                popups = {};
                            else
                                popups = result;

                            popups[key] = {};
                            return callback(popups[key]);
                        }

                        popups = result;
                        callback(popups[key]);
                    });

                if (popups[key] === undefined)
                    popups[key] = {};

                callback(popups[key]);
            }, function () {
                console.log('no user into storage');
                error && error();
            });

        },
        'save': function (callback) {
            db.save('popups', popups, callback);
        }
    };

    var demoStorage = {
        'data': function (callback) {
            callback && callback(demoData);
        },
        'save': function (data, callback) {
            demoData = data;
            callback && callback(demoData);
        }
    };

    var langStorage = {
        'data': function (callback, error) {
            if (lang === null)
                return db.load('lang', function (result) {
                    if (!result && error)
                        return error();

                    else if (result)
                    {
                        lang = result;
                        callback(lang);
                    }
                });

            callback(lang);
        },
        'save': function (langToSave, callback) {
            lang = langToSave;
            db.save('lang', lang, callback);
        }
    };

    var deliveryStorage = {
        'data': function (callback) {
            db.load('delivery', callback);

        },
        'save': function (data, callback) {
            db.save('delivery', data, callback);
        }
    }

    var customStorage = {
        'data': function (name, callback) {
            name = 'custom-' + name;
            db.load(name, callback);

        },
        'save': function (name, data, callback) {
            name = 'custom-' + name;
            db.save(name, data, callback);
        }
    }

    var clearStorage = function (callback) {
        localStorage.removeItem('user');
        localStorage.removeItem('presents');
        localStorage.removeItem('companies');
        localStorage.removeItem('delivery');
//        localStorage.removeItem('popups');

        companies = null;
        presents = null;
        user = null;
        popups = null;

        callback && callback();
    };



    var storageService = {
        'companies': companyStorage,
        'presents': presentsStorage,
        'user': userStorage,
        'popups': popupsStorage,
        'lang': langStorage,
        'demo': demoStorage,
        'deliveryStorage': deliveryStorage,
        'customStorage': customStorage,
        'clear': clearStorage
    };

    return storageService;
});



