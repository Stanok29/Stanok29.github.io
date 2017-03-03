define(['dom7'], function ($$) {

    return {
        'on': function (module, event, cb) {
            $$('body').on(module + ":" + event, function (data) {
                cb(data.detail);
            });
        },
        'trigger': function (module, event, data) {
            $$('body').trigger(module + ":" + event, data);
        }
    };
});


