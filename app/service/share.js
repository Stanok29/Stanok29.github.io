define([], function () {
    'use strict';

    var handler = null;

    return {
        setRateHandler: function (newHandler) {
            handler = newHandler;
        },
        removeRateHandler: function () {
            handler = null;
        },
        invokeHandler: function(){
            handler && handler();
            handler = null;
        },
//        getHandler: function () {
//            return handler;
//        }
    };

});


