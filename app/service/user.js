define(['service/api', 'config', 'service/storage', 'service/notify', 'lang/message', 'service/social'],
        function (api, config, storage, notify, langService, social) {

//    var currentUser = false;
//    var authType = false;
            var pushToken = null;

            var getPushToken = function ()
            {
                return pushToken ? pushToken : '123123';
            };

            var getPlatform = function () {
                return config.platform;
            };

            var getUUID = function () {
                return (window.device ? window.device.uuid : '1234567890');
            };

            var addPushData = function (data)
            {
                data.pushToken = getPushToken();
                data.uuid = getUUID();
                data.platform = getPlatform();

            };

            var authTypes = {
                app: 'app',
                google: 'google',
                facebook: 'facebook'
            };

            var loadUser = function (callback, error) {
                storage.user.data(callback, error);
            };

            var saveUser = function (user, callback) {
                storage.user.save(user, callback);
            };

            var prepareUser = function (user) {
                if (user.avatarImg)
                    user.avatar = config.domain + "img/get/" + user.avatarImg + "/" + user.id;
            };

            var registerPrivate = function (registerData, cb, er) {
                var register = function () {
                    addPushData(registerData);

                    //registerData.deviceId = getPushToken();

                    registerData.language = langService.language();

                    api.register(registerData,
                            function (result) {
                                var newUser = {};
                                newUser.currentUser = result.user;
                                prepareUser(newUser.currentUser);


                                newUser.authType = authTypes.app;

                                newUser.token = result.token;

                                saveUser(newUser, function () {
                                    if (typeof cb === 'function')
                                        cb(newUser);
                                });
                            }, er);
                };

                if (config.demo)
                    demoLogout(register);
                else
                    register();

            };

            var loginPrivate = function (loginData, cb, er) {
                var login = function () {
                    addPushData(loginData);
//                    loginData.deviceId = getPushToken();

                    api.login(loginData, function (result) {
                        var user = {};

                        user.currentUser = result.user;
                        prepareUser(user.currentUser);

                        user.authType = authTypes.app;

                        user.token = result.token;

                        saveUser(user, function () {
                            if (user.currentUser.language)
                                langService.changeLang(user.currentUser.language, function () {
                                    cb && cb(user);
                                });

                            else
                                cb && cb(user);
                        });
                    }, er);
                };

                if (config.demo)
                    demoLogout(login);
                else
                    login();

            };

            var demoLogin = function (cb, err)
            {
                config.demo = true;
                var user = {};
                user.currentUser = {
                    email: 'demo@demo.demo',
                    name: 'demo user',
                    id: 'demoid',
                    birthdayDate: new Date(1990, 0, 1)
                };
                user.authType = authTypes.app;

                saveUser(user, function () {
                    if (typeof cb === 'function')
                        cb(user);
                });
            };

            var demoLogout = function (cb, err) {
                config.demo = false;
                storage.clear(cb);
            };

            var socialAuth = function (data, cb, er)
            {
                var auth = function () {
                    addPushData(data)
                    //data.deviceId = pushToken;

                    data.language = langService.language();

                    api.socialAuth(data, function (result) {
                        var user = {};
                        user.currentUser = result.user;

                        prepareUser(user.currentUser);

                        user.token = result.token;
                        user.authType = data.authType;

                        saveUser(user, function () {
                            if (user.currentUser.language)
                                langService.changeLang(user.currentUser.language, function () {
                                    cb && cb(user);
                                });

                            else
                                cb && cb(user);
                        });
                    }, er);
                };

                if (config.demo)
                    demoLogout(auth);
                else
                    auth();
            };

            var facebookAuth = function (data, cb, err) {
                data.authType = authTypes.facebook;
                data.facebookUid = data.id;

                //data.avatar = data.picture.data.url;
                data.avatar = 'https://graph.facebook.com/' + data.id + '/picture?type=large';

                var date = Date.parse(data.birthday);
                if (date)
                    data.dateOfBirth = date;

                socialAuth(data, cb, err);
            };

            var googleAuth = function (data, cb, err)
            {
                data.authType = authTypes.google;
                data.googleUid = data.userId;
                data.googleToken = data.oauthToken ? data.oauthToken : data.accessToken;//ios strange behavior

                data.avatar = data.imageUrl;
                data.name = data.displayName;

                var date = Date.parse(data.birthday);
                if (date)
                    data.dateOfBirth = date;

                socialAuth(data, cb, err);
            };

            var privateLogout = function (callback) {
                if (config.demo)
                    return demoLogout(callback);

                loadUser(function (user) {
                    api.logout(function () {
                        notify.stop();

                        if (user.authType == authTypes.app)
                        {
                            config.demo = false;
                            storage.clear(callback);

                        }
                        else if (user.authType == authTypes.facebook)
                        {
                            social.fb.logout(function (result) {
                                storage.clear(callback);
                            });
                        }
                        else
                        {
                            social.google.logout(function (result) {
                                storage.clear(callback);
                            });
                        }
                    });
                });
            };

            var authed = function (callback)
            {
                loadUser(function (user) {
                    callback(true);
                }, function () {
                    callback(false);
                });
            }

            var getUser = function (callback, error)
            {
                loadUser(callback, error)
            };

            var applySettings = function (callback) {
                if (config.demo)
                    return;

                loadUser(function (user) {
                    api.setToken(user.token);

                    var cb = function () {
                        notify.init();
                        callback && callback();
                    };

                    if (user.currentUser.language)
                        langService.changeLang(user.currentUser.language, cb)
                    else
                        cb && cb();

                }, function (error) {
                    console.log('no user');
                });
            };

            var saveLanguage = function (callback, error) {
                var lang = langService.language();

                if (config.demo)
                    return callback && callback();


                api.saveLanguage({
                    language: lang
                }, function () {
                    loadUser(function (user) {
                        user.currentUser.language = lang;

                        saveUser(user, callback);
                    });
                }, error);
            };

            return {
                'login': loginPrivate,
                'demoLogin': demoLogin,
                'googleAuth': googleAuth,
                'facebookAuth': facebookAuth,
                'register': registerPrivate,
                'logout': privateLogout,
                'getUser': getUser,
                'authed': authed,
                'saveProfile': function (data, cb) {
                    data.dateOfBirth = data.birthdayDate;
                    api.saveProfile(data, function (result) {
                        loadUser(function (user) {
                            user.currentUser.name = data.name;
                            user.currentUser.email = data.email;
                            user.currentUser.birthdayDate = data.birthdayDate;
                            user.currentUser.telephone = data.telephone;
                            user.currentUser.secret = data.secret;
                            user.currentUser.gender = data.gender;
                            user.currentUser.avatarImg = data.avatarImg;

                            prepareUser(user.currentUser);

                            saveUser(user, function (result) {
                                console.log('save profile success');

                                if (typeof cb == 'function')
                                    cb(user);
                            });
                        });

                    }, function (error) {
                        console.log('error when save profile', error);
                    });
                },
                'saveSecret': function (phone, secret, cb, er) {

                    var data = {'telephone': phone, 'secret': secret};

                    api.saveSecret(data, function () {
                        loadUser(function (user) {

                            user.currentUser.telephone = data.telephone;
                            user.currentUser.secret = data.secret;

                            saveUser(user, function () {
                                cb(user);
                            });
                        });

                    }, er);

                },
                'askSecret': function (cb) {
                    loadUser(function (user) {
                        cb(!(user.currentUser.telephone && user.currentUser.secret));
                    });
                },
                'loadAvatar': function (avatar, mobile, callback, error)
                {
                    if (config.demo)
                        return callback && callback({url: avatar});

                    api.upload(avatar, mobile, callback, error);
                },
                getAvatar: function (small, callback) {
                    loadUser(function (user) {
                        if (!user.currentUser.avatar)
                            return callback(null);

                        if (!small)
                            return callback(user.currentUser.avatar);

                        callback(user.currentUser.avatar + "?height=108&width=108&resize=1&crop=1");
                    });

                },
                setPushToken: function (id)
                {
                    pushToken = id;
                },
                applySettings: applySettings,
                getSettings: function (callback) {
                    callback({language: langService.language()});
                },
                saveSettings: function (settings, callback) {
                    if (settings.language)
                    {
                        langService.changeLang(settings.language, function (res) {
                            saveLanguage(callback);
                        });
                    }
                },
                getDemoData: function (callback)
                {
                    storage.demo.data(callback);
                },
                setDemoData: function (data, callback)
                {
                    storage.demo.save(data, callback);
                },
                resetSocial: function (callback) {
                    api.resetSocial({}, callback)
                },
                removeUser: function (callback) {

                    api.removeUser({}, function () {
                        privateLogout(function () {
                            callback && callback();
                        });
                    });
                },
                getChatContacts: function (callback, error) {
                    api.getChatContacts({}, callback, error);
                },
                recoverPassword: function (email, callback, error)
                {
                    api.sendRecoverEmail({email: email}, callback, error);
                },
                
                ifBlocked : function(cb){
                    api.ifBlocked({}, function(d){
                        cb(d.blocked);
                    });
                }


            };
        });


