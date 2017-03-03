define(['service/api'], function (api) {
    'use strict';



    return {
        'send': function (html, subject, email, cb) {
            api.request.send({'html': html, 'subject': subject, 'email': email}, cb);

        }
    };

});


