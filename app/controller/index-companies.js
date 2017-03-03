define(['text!tpl/companies.html', 'controller/list-companies'], function (tpl, factory) {
    'use strict';

    return factory(false, tpl, 'companies');
});