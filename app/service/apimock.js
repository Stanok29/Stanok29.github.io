define(function () {
    var mocker = function (mockFunction) {
        return function (data, cb, error) {
            var d = mockFunction(data);
            if (d.response) {
                setTimeout(function () {
                    cb(d.response);
                }, 400);
                return;
            }

            error && error(d);
        }
    }

    var companies = [
        {
            id: 1,
            name: 'Lendav taldrik',
            joined: false,
            distance: 10,
            coins: 0,
            presents: 10,
            pic: './img/tmp-img.png',
        },
        {
            id: 2,
            name: 'Center',
            joined: false,
            distance: 20,
            coins: 0,
            presents: 1,
            pic: './img/tmp-img.png',
        },
        {
            id: 3,
            name: 'Coffee room',
            joined: false,
            distance: 25,
            coins: 150,
            presents: 10,
            pic: './img/tmp-img.png',
        },
        {
            id: 4,
            name: 'Polina',
            joined: false,
            distance: 30,
            coins: 0,
            presents: 1,
            pic: './img/tmp-img.png',
        },
        {
            id: 5,
            name: 'Paratov',
            joined: false,
            distance: 35,
            coins: 0,
            presents: 1,
            pic: './img/tmp-img.png',
        },
        {
            id: 6,
            name: 'Mint',
            joined: false,
            distance: 40,
            coins: 0,
            presents: 1,
            pic: './img/tmp-img.png',
        },
    ];

    var presents = [
        {
            companyId: 1,
            presents: [
                {
                    id: '1',
                    name: 'First compliment',
                    description: 'Вафли с муссом из белого шоколада и сорбетoм из маракуйи',
                    pic: 'img/tmp-img2.png',
                    price: '',
                    progress: '',
                    type: 'first'
                },
                {
                    id: '2',
                    name: 'Каждый второй кофе бесплатно',
                    description: 'Мы любим дарить тепло нашим клиентам, поэтому нет ничего лучше второй чашечки ароматного кофе просто так!',
                    pic: 'img/tmp-img2.png',
                    price: '',
                    progress: '',
                    type: 'bonus',
                    period: '21 мая — 27 июня 2015 года'
                },
//                {
//                    id: '3',
//                    name: 'First compliment',
//                    description: 'Вафли с муссом из белого шоколада и сорбетoм из маракуйи',
//                    pic: 'img/tmp-img2.png',
//                    price: '0',
//                    progress: '',
//                },
                {
                    id: '4',
                    name: 'CINNAMON SQUARES',
                    description: 'This is a first-place finish. A big rich slice of chocolate fudge cake drizzled...',
                    pic: 'img/tmp-img2.png',
                    price: '50',
                    progress: '55',
                    type: 'permanent'
                },
                {
                    id: '5',
                    name: 'CINNAMON SQUARES',
                    description: 'This is a first-place finish. A big rich slice of chocolate fudge cake drizzled...',
                    pic: 'img/tmp-img2.png',
                    price: '100',
                    progress: '15',
                    type: 'permanent'
                },
            ]
        }
    ];

    var messages = [
        {
            companyId: 1,
            name: 'F-Hoone',
            message: 'Привет, как дела?',
            date: new Date(),
            pic: './img/tmp-img.png',
        },
        {
            companyId: 2,
            name: 'Coffee house',
            message: 'Йо!',
            date: new Date(2015, 5, 10, 2, 21),
            pic: './img/tmp-img.png',
        },
        {
            companyId: 3,
            name: 'Helen and guys',
            message: 'Негры едят снег',
            date: new Date(2015, 3, 10, 8, 11),
            pic: './img/tmp-img.png',
        },
        {
            companyId: 4,
            name: 'Hell on the wheels',
            message: 'Андроид где',
            date: new Date(2015, 3, 11, 15, 45),
            pic: './img/tmp-img.png',
        }
    ];

    var notifications = [
        {
            companyId: 1,
            date: new Date(2015, 4, 24, 2, 2),
            companyName: 'Lendav Taldriik',
            message: 'запустил новую кампанию «Каждый Пятый Латте по цене эспрессо!»',
            coins: 0,
            present: null,
            'new': false,
        },
        {
            companyId: 2,
            date: new Date(2015, 4, 24, 3, 3),
            companyName: 'Silk',
            message: 'начислил вам баллы в честь дня рождения!',
            coins: 50,
            present: null,
            'new': true

        },
        {
            companyId: 3,
            date: new Date(2015, 4, 24, 5, 4),
            companyName: 'Candy shop',
            message: 'сделал вам подарок в честь дня рождения! Срок действия акции до 23:00 сегодняшнего дня',
            coins: 0,
            present: {
                name: 'First compliment',
                description: 'Вафли с муссом из белого шоколада',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 30),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 29),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 28),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 27),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 26),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
        {
            companyId: 3,
            date: new Date(2014, 3, 25),
            companyName: 'Verona',
            message: 'Супер-акция! Бонусы и пиццы всем!',
            coins: 20,
            present: {
                name: 'Пицца Архангельская',
                description: 'Пицца с весьма необычным сочетанием элементов',
                pic: 'img/tmp-img3.png',
            },
            'new': true
        },
    ];

    var chat = [
        {
            companyId: 1,
            messages: [
                {
                    my: true,
                    date: new Date(2015, 3, 10, 8, 11),
                    stars: 2,
                    message: '1 Приветствую! Достойная оценка достойному сервису!',
                    pic: false
                },
                {
                    my: false,
                    date: new Date(2015, 3, 10, 8, 20),
                    message: '2 Мы тут подумали и решили накинуть баллов',
                    pic: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg',
                    present: {
                        pic: './img/tmp-img3.png',
                        name: 'Вафли с муссом из белого шоколада'
                    }
                },
                {
                    my: false,
                    date: new Date(2015, 3, 10, 8, 21),
                    message: '3 Мы тут подумали и решили накинуть баллов',
                    pic: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg',
                    coins: 30
                },
                {
                    my: false,
                    date: new Date(2015, 3, 10, 8, 26),
                    message: '4 И еще решили накинуть баллов',
                    pic: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg',
                    coins: 50
                },
                {
                    my: true,
                    date: new Date(2015, 3, 10, 8, 40),
                    stars: 3,
                    message: '5 Ну вы прям боги!',
                    pic: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg',
                    'new': true
                },
                {
                    my: false,
                    date: new Date(2015, 4, 10, 3, 41),
                    message: '6 А то!',
                    pic: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg',
                    coins: false,
                    'new': true
                },
            ]
        }

    ];

    var users = [
        {
            name: 'Iliya Garakh',
            email: 'garakh@primepix.ru',
            getNewsLetters: true,
            getPushNotifications: false,
            password: '',
            id: 1
        },
        {
            name: 'Yurii Lichutin',
            email: 'lichutin@primepix.ru',
            getNewsLetters: false,
            getPushNotifications: true,
            password: '',
            id: 2
        }
    ];

    var api = {
        'login': function (data) {
            var ok = data.email == 'test' && data.password == 'test';
            return {
                response: ok ? users[0] : false,
                error: ok ? false : 'badcred'
            }
        },
        'register': function (registerData) {
            var exists = users.filter(function (user) {
                return user.email == registerData.email;
            });
            if (exists.length > 0)
                return {response: false, error: 'userAlreadyExists'};

            var newUser = {
                name: registerData.name,
                email: registerData.email,
                getNewsLetters: true,
                getPushNotifications: true,
                password: registerData.password,
                date: registerData.date
            };

            users.push(newUser);
            return {response: newUser};
        },
        /*
         * data содержит основные данные пользователя (имя, email, пол, аватар, токен авторизации фейсбука, дату рождения
         */
        'registerByFacebook': function (data) {
            //токен юзера надо проверять на подлинность на серевере с помощью токена приложения
            var newUser = {
                email: data.email,
                name: data.name,
                getNewsLetters: true,
                getPushNotifications: true,
                gender: data.gender,
                dateOfBirth: data.birthday,
                picture: data.picture,
            };

            users.push(newUser);
            return {response: newUser};
        },
        'findCompany': function (id) {
            var r = companies;
            r = r.filter(function (item) {
                return item.id == id;
            });

            if (r) {
                return  {
                    response: r[0]
                }
            } else {
                return {
                    response: false,
                    error: 'notfound'
                }
            }

        },
        'findCompanies': function (data) {
            var r = companies;
            if (data.query) {
                r = r.filter(function (item) {
                    return item.name.indexOf(data.query) != -1;
                });
            }

            if (data.onlyJoined) {
                r = r.filter(function (item) {
                    return item.joined;
                });
            }

            if (data.sortBy) {
                r = r.sort(function (a, b) {
                    if (data.sortBy == 'distance') {
                        return (a.distance < b.distance ? -1 : 1) * data.sort;
                    }

                    if (data.sortBy == 'name') {
                        return (a.name < b.name ? -1 : 1) * data.sort;
                    }
                });
            }

            if (data.page != undefined) {
                var i = -1;
                var left = 3 * data.page;
                var right = left + 3;
                r = r.filter(function () {
                    i++;
                    return left <= i && i < right;
                });
            }
            return {
                response: r
            }
        },
        joinCompany: function (data) {
            var userId = data.userId;
            var companyId = data.companyId;

            var company = companies.filter(function (item) {
                return item.id == companyId;
            })[0];

            company.joined = true;

            return {response: true};

        },
        leaveCompany: function (data) {
            var userId = data.userId;
            var companyId = data.companyId;

            var company = companies.filter(function (item) {
                return item.id == companyId;
            })[0];

            company.joined = false;

            return {response: true};
        },
        'getPresents': function (companyId)
        {
            var p = presents;
            p = p.filter(function (item) {
                return item.companyId == companyId;
            });

            if (p.length < 1)
                return {response: []};

            return {
                response: p[0].presents
            };
        },
        'getPresent': function (data) {
            var p = presents;
            p = p.filter(function (item) {
                return item.companyId == data.companyId;
            });
            if (p.length > 0)
            {
                var result = p[0].presents.filter(function (item) {
                    return item.id == data.presentId;
                });

                if (result.length > 0)
                    return {response: result[0]};
            }

            return {response: false, error: 'not found'};
        },
        'removePresent': function (presentId) {
            var index = 0;

            for (; index < presents[0].presents.length; index++) {
                if (presents[0].presents[index].id == presentId)
                    break;
            }

            presents[0].presents.splice(index, 1);
            return {reponse: true};
        },
        'getNotifications': function (data) {
            var n = notifications;
            n = n.sort(function (a, b) {
                return (a.date > b.date ? -1 : 1);
            });

            var i = -1;
            var left = 5 * data.page;
            var right = left + 5;
            n = n.filter(function () {
                i++;
                return left <= i && i < right;
            });

            return {response: n};
        },
        'getMessages': function (data) {
            var r = messages;
            r = r.sort(function (a, b) {
                return (a.date > b.date ? -1 : 1);
            });
            return {
                response: r
            }
        },
        'getChat': function (data) {
            var r = chat;
            r = r.filter(function (item) {
                return item.companyId == data.companyId;
            })[0];

            if (!r)
                return {
                    response: []
                }

            r = r.messages;
            r = r.sort(function (a, b) {
                return (a.date > b.date ? -1 : 1);
            });
            var i = -1;
            var left = 3 * data.page;
            var right = left + 3;
            r = r.filter(function () {
                i++;
                return left <= i && i < right;
            });
            return {
                response: r
            }
        },
        'sendChatMessage': function (message) {
            return {
                response: true
            }
        },
        addCoins: function (data) {
            var company = companies.filter(function (item) {
                return item.id == data.companyId;
            })[0];

            company.coins += data.coins;

            return {response: true};
        }
    };
    for (var i in api) {
        api[i] = mocker(api[i]);
    }

    api['operations'] = {
        gift: 'gift',
        charge: 'charge'
    };

    return api;
});


