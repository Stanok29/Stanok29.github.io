define(function () {
    'use strict';

    return {
        'mobile': (window.device ? true : false),
        'domain': 'http://loya.mobi/',
        'platform':  (window.device ? window.device.platform : 'browser'),
        'apimock': false,
        'rateActuality': 30 * 60 * 1000,
        'minimalAge': 1000 * 60 * 60 * 24 * 365 * 12, //12 years
        'maximumAge': 1000 * 60 * 60 * 24 * 365 * 90, //90
        'loyalityDistance': 100 * 1000, //100 km
    };
    
    
});