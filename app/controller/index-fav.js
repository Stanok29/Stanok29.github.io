define(['text!tpl/favs.html', 'controller/list-companies'], function (tpl, factory) {
    'use strict';

    return factory(true, tpl, 'favs');
});