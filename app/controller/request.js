define(['app', 'dom7', 'service/request', 'moment'],
        function (app, $$, requestService, moment) {
            'use strict';


            moment.locale('ru');
            var reserveDate = moment().add(10 - moment().minutes() % 10, 'minutes');


            var render = function () {
                renderDate();
            }

            var renderDate = function () {
                function capitalizeFirstLetter(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                $$('#request-date-day').html(reserveDate.format('DD'));
                $$('#request-date-month').html(capitalizeFirstLetter(reserveDate.format('MMM')));
                $$('#request-date-year').html(reserveDate.format('YYYY'));
                $$('#request-date-hour').html(reserveDate.format('HH'));
                $$('#request-date-min').html(reserveDate.format('mm'));

                onChange();
            }

            var buildHtml = function () {
                var html = '';
                html += '<b>Запрос на бронирование стола</b><br><br>';

                html += '<b>Имя:</b> ' + $$('#request-info-name').val() + '<br>';
                html += '<b>Телефон:</b> ' + $$('#request-info-phone').val() + '<br>';
                html += '<b>Кол-во гостей:</b> ' + $$('#request-info-guests').val() + '<br>';
                html += '<b>На дату:</b> ' + reserveDate.format('HH:mm DD.MM.YYYY') + '<br>';
                html += '<b>Комментарий:</b> ' + $$('#request-info-comment').val();

                return html;
            }

            var onChange = function () {
                var ok = true;
                if ($$('#request-info-name').val().trim() === '')
                    ok = false;

                if ($$('#request-info-phone').val().trim() === '')
                    ok = false;

                if (ok) {
                    $$('#request-send').removeClass('notactive');
                } else {
                    $$('#request-send').addClass('notactive');
                }
                
                return ok;
            }

            $$(document).on('click', '#request-send', function () {

                if(!onChange()){
                    return false;
                }

                requestService.send(buildHtml(), '', '', function () {
                    app.f7.alert('Мы получили вашу заявку', function () {
                        app.view.router.back({pageName: 'index-page', force: true, pushState: false, query: {'pageId': 1}});
                    });
                }, function () {
                    app.f7.alert('Кажется что-то пошло не так :(');
                });


                return false;
            });

            $$(document).on('click', '#request-date-day-inc', function () {
                reserveDate.add(1, 'days');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-day-dec', function () {
                reserveDate.subtract(1, 'days');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-month-inc', function () {
                reserveDate.add(1, 'months');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-month-dec', function () {
                reserveDate.subtract(1, 'months');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-year-inc', function () {
                reserveDate.add(1, 'year');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-year-dec', function () {
                reserveDate.subtract(1, 'year');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-hour-inc', function () {
                reserveDate.add(1, 'hours');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-hour-dec', function () {
                reserveDate.subtract(1, 'hours');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-min-inc', function () {
                reserveDate.add(5, 'minutes');
                renderDate();
                return false;
            });
            $$(document).on('click', '#request-date-min-dec', function () {
                reserveDate.subtract(5, 'minutes');
                renderDate();
                return false;
            });

            $$(document).on('change', '#request-info-name, #request-info-phone', function () {
                onChange();
            });

            $$(document).on('change', '#request-info-guests', function () {
                var guests = $$(this).val();
                guests = Math.round(guests);
                if (guests < 1) {
                    guests = 1;
                }
                $$(this).val(guests);
                ;

                onChange();
            });

            return {
                'init': function (page) {

                    render();

                }
            };
        });