define(['config', 'service/apimock', 'dom7', 'custom/info'], function (config, apimock, $$, info) {

    var _token = null;
    var internetErrorHandler = null;
    var tokenErrorHandler = null;
    var commonErrorHandler = null;

    var handleResponse = function (d, cb, error) {
        d = JSON.parse(d);

        if (d.response.user && d.response.user.birthdayDate)
            d.response.user.birthdayDate = convertToJsDate(d.response.user.birthdayDate.sec);

        if (d.response) {
            cb(d.response);
            return;
        }

        if (d.error == 'Token error')
            return tokenErrorHandler && tokenErrorHandler();

        error && error(d);
        !error && commonErrorHandler && commonErrorHandler(d);
    };



    var jsonget = function (endPoint, hidden) {
        return function (data, cb, error) {
            if (_token)
                data._token = _token;

            if (data.dateOfBirth)
                data.dateOfBirth = convertToPhpDate(data.dateOfBirth);

            data._companyId = info.getCompanyId();

            $$.ajax({
                success: function (success) {
                    console.log('target', endPoint);
                    handleResponse(success, cb, error)
                },
                error: function (err) {
                    console.log('api errror', err);

                    !hidden && internetErrorHandler && internetErrorHandler(err);
                    error && error({error: 'internet'});
                },
                method: 'POST',
                url: config.domain + 'api_custom/' + endPoint,
                data: data
            });
        };
    };

    var convertToPhpDate = function (jsDate)
    {
        return jsDate / 1000;
    };

    var convertToJsDate = function (phpDate) {
        return phpDate * 1000;
    };

    var prepareCompanies = function (companies)
    {
        for (var i = 0; i < companies.length; i++)
        {
            if (companies[i].imgLogo)
                companies[i].imgLogo = config.domain + "img/get/" + companies[i].imgLogo + "/" + companies[i].login + "?width=110&height=110&resize=1&crop=1";
            else
                companies[i].imgLogo = './img/cafe_def_small.png';

            if (companies[i].imgMainScreen)
                companies[i].imgMainScreen = config.domain + "img/get/" + companies[i].imgMainScreen + "/" + companies[i].login + "?height=360&width=600&resize=1&crop=1";
            else
                companies[i].imgMainScreen = './img/cafe_def.png';
        }
    };

    var api = {
        'login': function (data, cb, error) {
            jsonget('authorize')(data, function (result) {
                _token = result.token;
                cb(result);
            }, error);
        }, //noExistUser, noCorrectPassword
        'socialAuth': function (data, cb, error)
        {
            jsonget('loginSocial')(data, function (result) {
                _token = result.token;
                cb(result);
            }, error);
        },
        'logout': function (cb, error) {
            _token = null;
            cb();
        },
        'register': function (data, cb, error) {
            jsonget('register')(data, function (result) {
                _token = result.token;
                cb(result);
            }, error);
        }, //userAlreadyExists


        'getMyGeometry': function (cb, error) {
            jsonget('getMyGeometry')({}, function (result) {
                cb(result);
            }, error);
        },
        'findCompany': function (data, cb, error) {//companyNotFound
            jsonget('findCompany')(data, function (result) {
                prepareCompanies([result]);
                cb(result);
            }, error);
        },
        'findCompanies': function (data, cb, error) {
            var endpoint = config.demo ? 'demoFindCompanies' : 'findCompanies';
            jsonget(endpoint)(data, function (result) {
                prepareCompanies(result);
                cb(result);
            }, error);
        },
        'leaveCompany': jsonget('leaveCompany'), //(companyId); companyNotExist

        'getPresents': function (data, cb, error) {
            var endpoint = config.demo ? 'demoGetPresents' : 'getPresents';
            jsonget(endpoint)(data, cb, error);
        }, //(companyId); companyNotFound
        'getPresent': jsonget('getPresent'),
        'getChatContacts': function (data, callback, error) {
            if (config.demo)
                return callback && callback({contacts: []});

            jsonget('getChatContacts')(data, function (result) {
                result.contacts = result.contacts.sort(function (a, b) {
                    if (b.date > a.date)
                        return -1;
                    else if (b.date == a.date)
                        return 0;
                    else
                        return 1;
                }).map(function (item) {
                    item.date = convertToJsDate(item.date.sec);
                    return item;
                });
                callback(result);
            }, error);
        },
        'getChat': function (data, callback, error) {
            if (config.demo)
                return callback && callback({messages: []});

            jsonget('getChat')(data, function (result) {
                for (var i = 0; i < result.messages.length; i++)
                {
                    result.messages[i].date = convertToJsDate(result.messages[i].date.sec);
                    result.messages[i].my = (result.messages[i].author == 0);//0 - client, 1 - company
                }
                callback(result);
            }, error);
        }, //{companyId, page}//может, тоже надо обсудить (н-р размер страницы)
        'sendChatMessage'
                : jsonget('sendChatMessage'), //{companyId, message, stars(1-5)}; errors: companyId
        'saveProfile': jsonget('saveProfile'),
        'saveSecret': jsonget('saveSecret'),
        'saveLanguage': jsonget('saveLanguage'),
        //'upload':jsonget('upload'),
        'getNotifications': function (data, callback, error) {
            jsonget('getUpdates', true)(data, function (result) {
                for (var i = 0; i < result.length; i++)
                {
                    result[i].date = convertToJsDate(result[i].date.sec);
                }
                callback(result);
            }, error);
        }, //onlyNew:true/false
        'disablePush': jsonget('disablePush'),
        'enablePush': jsonget('enablePush'),
        'sharedFb': jsonget('sharedFb'),
        'getFirstImg': jsonget('getFirstImg'),
        'resetSocial': jsonget('resetSocial'),
        'removeUser': jsonget('resetUser'),
        'ifBlocked': jsonget('ifBlocked'),
        'upload': function (data, mobile, callback, error)
        {
            var success = function (result) {
                handleResponse(result, callback, error);
            };
            var error = function (err) {
                console.log('ajax error', err);
                error && error(err);
            };
            var url = config.domain + 'api/upload';

            if (!mobile) {
                var formData = new FormData();
                formData.append('_token', _token);
                formData.append('file', data);

                $$.ajax({
                    url: url,
                    method: 'post',
                    conentType: false,
                    processData: false,
                    cache: false,
                    data: formData,
                    success: success,
                    error: error
                });
            }
            else
            {
                var options = new FileUploadOptions();
                options.fileKey = 'file';

                var fileName = data.substr(data.lastIndexOf('/') + 1);
                if (!fileName.match(/\.jpeg/))
                    fileName = fileName + '.jpeg';

                options.fileName = fileName;
                options.mimeType = 'image/jpg';

                var params = new Object();
                params._token = _token;

                options.params = params;
                options.chunkedMode = false;

                var ft = new FileTransfer();
                ft.upload(data, url, function (result) {
                    success(result.response);
                }, error, options);
            }

        },
        'getLastUpdateDate': jsonget('getLastUpdateDate'),
        'sendRecoverEmail': jsonget('sendRecoverEmail'),
        'markMaillingPushAsRead': jsonget('markMaillingPushAsRead'),
        'operations'
                : {
                    gift: 'gift',
                    charge: 'charge'
                },
        'setToken': function (token)
        {
            _token = token;
        },
        'setInternetErrorHandler': function (handler) {
            internetErrorHandler = handler;
        },
        'setTokenErrorHandler': function (handler)
        {
            tokenErrorHandler = handler;
        },
        'setCommonErrorHandler': function (handler)
        {
            commonErrorHandler = handler;
        },
        'delivery': {
            'getCatalog': jsonget('delivery/getCatalog'),
            'getShippingMethods' : jsonget('delivery/getShippingMethods'),
            'getPaymentMethods' : jsonget('delivery/getPaymentMethods'),
            'getSettings' : jsonget('delivery/getSettings'),
            'sendOrder' : jsonget('delivery/sendOrder'),
        },
        'request' : {
            'send' : jsonget('sendRequest'),
        }
    };


    if (config.apimock)
        return apimock;

    return api;
});


