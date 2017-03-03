define(['app', 'service/user', 'dom7', 'service/event', 'moment', 'config', 'service/cache'], function (app, userService, $$, hub, moment, config, cache) {
    'use strict';

    var store = $$.createStore();

    var userInfo;

    var avatarImg;

    var render = function () {
        $$('#profile-form-name').val(userInfo.name);
        $$('#profile-form-email').val(userInfo.email);

        var date = moment(userInfo.birthdayDate)
        date = date.format('YYYY-MM-DD');
        $$('#profile-form-dateOfBirth').val(date);

        $$('#profile-form-phoneNumber').val(userInfo.telephone);
        $$('#profile-form-secret').val(userInfo.secret);

        $$('a[data-gender="' + userInfo.gender + '"]').addClass('selected');
    };

    var showError = function (error) {
        app.f7.modal({
            title: app.langService.get(error) + ', ' + app.langService.get('controller-profile-5'),
            buttons: [{
                    text: app.langService.get('controller-profile-3'),
                }, {
                    text: app.langService.get('controller-profile-4'),
                    onClick: function () {
                        app.view.router.back();
                    }
                }]
        });
    };

    var serializeForm = function () {
        var formData = app.f7.formToJSON('#profile-form');

        var useEmail = document.getElementById('profile-form-email').checkValidity();

        var settings = {
            name: formData['profile-form-name'],
            email: useEmail ? formData['profile-form-email'] : null,
//            password: formData['profile-form-password'],
            telephone: formData['profile-form-phoneNumber'],
            secret:formData['profile-form-secret'],
        };

        if (!settings.name)
            return showError('wrongName');

        if (!useEmail || !settings.email)
            return showError('wrongEmail');

        var date = Date.parse(formData['profile-form-dateOfBirth']);
        if (!date || date > Date.now() ||
                (Date.now() - date) < config.minimalAge ||
                (Date.now() - date) > config.maximumAge)
            return showError('wrongDate');
        else
            settings.birthdayDate = date;

        if (!settings.telephone || !document.getElementById('profile-form-phoneNumber').checkValidity())
            return showError('wrongNumber');
        
        if (!settings.secret)
            return showError('emptySecret');
        

        var gender = $$('.sex-select a.selected').attr('data-gender');
        if (!gender)
            gender = null;

		settings.gender = gender;

        if (avatarImg)
            settings.avatarImg = avatarImg;

        return settings;
    };

    return {
        'init': function (page) {
            store.reset();
            userInfo = null;

            userService.getUser(function (user) {
                userInfo = user.currentUser;

                avatarImg = userInfo.avatarImg;

                if (userInfo.avatar)
                    $$('#profile-avatar-image').attr('data-pre-src', userInfo.avatar);

                cache.useRightImage($$('#profile-avatar-image'));

                $$('.profile-img').css('visibility', 'visible');

                $$('.sex-select a').on('click', function () {
					if($$(this).hasClass('selected')){
						$$('.sex-select a').removeClass('selected');
					}else{
						$$('.sex-select a').removeClass('selected');
						$$(this).addClass('selected');
					}
                });

                var loadAvatar = function (file) {
                    if (!config.mobile)
                        userService.loadAvatar(file, false, function (res) {
                            avatarImg = res.url;

                            var reader = new FileReader();
                            reader.onload = function (e) {
                                $$('#profile-avatar-image').attr('src', e.target.result);
                            };

                            reader.readAsDataURL(file);
                        }.cb(store), function (err) {
                            app.f7.alert(app.langService.get('avatarUpload'));
                        }.cb(store));
                    else
                        userService.loadAvatar(file, true, function (res) {
                            avatarImg = res.url;

                            $$('#profile-avatar-image').attr('src', file);
                        }.cb(store), function (err) {
                            app.f7.alert(app.langService.get('avatarUpload'));
                        }.cb(store));

                };

                if (!config.mobile)
                {
                    $$('#profile-file').change(function () {
                        var file = this.files[0];

                        loadAvatar(file);
                    });

                    $$('#profile-image-new').on('click', function () {
                        $$('#profile-file').click();
                    });
                }
                else
                {
                    var takePhoto = function (camera)
                    {
                        navigator.camera.getPicture(function (result) {
                            loadAvatar(result);
                        }, function (error) {
                            console.log('error with camera plugin', error);
                        }, {
                            destinationType: Camera.DestinationType.FILE_URI,
                            mediaType: Camera.MediaType.PICTURE,
                            sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
                            correctOrientation : true
                        });
                    };

                    $$('#profile-image-new').on('click', function () {
                        app.f7.modal({
                            title: app.langService.get('controller-profile-0'),
                            buttons: [{
                                    text: app.langService.get('controller-profile-1'),
                                    onClick: function () {
                                        takePhoto(true);
                                    }
                                }, {
                                    text: app.langService.get('controller-profile-2'),
                                    onClick: function () {
                                        takePhoto(false);
                                    }
                                }, {
                                    text: app.langService.get('controller-profile-6'),
                                }]
                        });

                    });
                }

                render();

                $$('.back-hint').on('click', function () {

                    //тут сохраняем настройки
                    var settings = serializeForm();

                    if (!settings)
                        return;

                    if (config.demo)
                        return app.view.router.loadPage('index-page.html');


                    userService.saveProfile(settings, function (newUser) {
                        if (avatarImg)
                            hub.trigger('profile', 'avatar', newUser);

                        app.view.router.loadPage({url: 'index-page.html', query: {pageId: '5'}});
                    });
                });
            }.cb(store));

            app.view.params.swipeBackPage = false;
        }
    };
});