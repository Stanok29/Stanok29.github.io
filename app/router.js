define(['dom7'], function ($$) {
    'use strict';

    function load(page) {
        var conFolder = 'app/controller/';
        if(page.name.substring(0, 7) === 'custom-'){
            conFolder = 'custom/';
        }
        
        require([conFolder + page.name + '.js'], function (controller) {
            controller.init(page);
        });
    }

    return {
        beforeInit: function (app, page) {
            if (page.fromPage)
                return;


            load(page);
        },
        afterAnimation: function (app, page) {

            var name = page.name;
            $$('.page.cached[data-page="' + name + '"]').remove();

            load(page);
        }
    };
});