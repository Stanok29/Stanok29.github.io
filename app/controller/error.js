define(['app', 'dom7'], function (app, $$) {
    'use strict';

    var error;
    var render = function () {
        //todo: это убрано в данном случае с экрана, может, есть смысл вернуть
        if (error)
            $$('#error-message').html(error);
    };


    $$(document).on('click', '#error-link', function () {
        app.view.router.back({pageName: 'index', force: true, pushState: false, query: {'forceReload' : true}});
        return false;
    });
    return {
        'init': function (page) {

            app.view.params.swipeBackPage = true;

            error = page.query.error;

            render();
        }
    }
});