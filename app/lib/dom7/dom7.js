define(function () {
    'use strict';

    Function.prototype.cb = function (store) {
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        store[id] = this;

        var callback = function () {
            if (store && store[id])
                store[id].apply(store[id], arguments);

            delete store[id];
        }

        return callback;
    }

    Dom7.getModel = function (id) {
        return function (model) {
            var updatedModel = {};
            for (var i in model) {
                updatedModel[i] = Dom7('#' + id + '-' + i).val();
            }

            return updatedModel;
        }
    }

    Dom7.extend = function (obj1, obj2) {
        for (var i in obj2)
            obj1[i] = obj2[i];

        return obj1;
    }

    Dom7.createStore = function () {
        return {
            reset: function () {
                for (var i in this) {
                    if (i !== 'reset')
                        delete this[i];
                }
            }
        };
    }

    return Dom7;
});