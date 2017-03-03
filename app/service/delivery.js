define(['service/api', 'config', 'service/company', 'custom/info'], function (api, config, companyService, customInfo) {
    'use strict';

    var order = {};
    var db = null;
    var onVariantsUpdate = null;
    var companyLogin = null;
    var settings = null;

    var resetOrder = function () {
        order = {
            'products': {},
            'shippingInfo': {},
            'paymentInfo': {},
            'comment': null
        };
    }
    resetOrder();

    var shippingMethods = null;
    var paymentMethods = null;

    var findProduct = function (id) {

        for (var i in db) {
            for (var j in db[i].products) {
                if (db[i].products[j].id === id)
                    return db[i].products[j];
            }
        }

        return false;
    }

    var findVariant = function (productId, id) {

        var product = findProduct(productId);
        if (!product.variants)
            return false;

        for (var i in product.variants) {
            if (product.variants[i].id === id)
                return product.variants[i];
        }

        return false;
    }

    var prepare = function (cb) {
        if (companyLogin)
            return cb();

        companyService.getCompany({companyId: customInfo.getCompanyId()}, function (result) {
            companyLogin = result.login;
            cb();
        });
    }

    return {
        'isLoaded': function () {
            for (var prop in order.products) {
                if (order.products.hasOwnProperty(prop))
                    return true;
            }

            return JSON.stringify(order.products) !== JSON.stringify({});
        },
        'onVariantsUpdate': onVariantsUpdate,
        'saveComment': function (text) {
            order.comment = text;
        },
        'getComment': function () {
            return order.comment;
        },
        'getCatalog': function (cb) {
            prepare(function () {
                if (db)
                    return cb(db);

                api.delivery.getCatalog({}, function (data) {
                    var catalog = data.catalog;
                    catalog = catalog.sort(function (a, b) {
                        return (a.sort < b.sort ? -1 : 1);
                    });

                    db = catalog;

                    for (var i in db) {
                        for (var j in db[i].products) {
                            if (db[i].products[j].img) {
                                db[i].products[j].imgBig = config.domain + "img/get/" + db[i].products[j].img + "/" + companyLogin + "?width=400&height=300&crop=1&resize=1";
                                db[i].products[j].imgSmall = config.domain + "img/get/" + db[i].products[j].img + "/" + companyLogin + "?width=200&height=200&crop=1&resize=1";
                            }
                        }
                    }

                    cb(catalog);
                });
            });
        },
        'getSettings': function (cb) {
            if (settings)
                return cb(settings);

            api.delivery.getSettings({}, cb);
        },
        'getVariants': function (productId, copyId) {
            var product = findProduct(productId);
            var variants = [];
            if (product.variants) {
                variants = product.variants.slice(0);
            }

            if (copyId === undefined)
                return variants;


            for (var i in variants) {
                variants[i].checked = false;

                if (order.products[productId] &&
                        order.products[productId][copyId] &&
                        order.products[productId][copyId].variants &&
                        order.products[productId][copyId].variants[variants[i].id]
                        )
                    variants[i].checked = true;
            }

            return variants;
        },
        'findProduct': findProduct,
        'order': {
            'reset': function () {
                resetOrder();
            },
            'sendOrder': function (cb) {
                api.delivery.sendOrder({'order': JSON.stringify(order)}, cb);
            },
            'orderProduct': function (productId, copyId, amount) {
                var product = findProduct(productId);

                if (!order.products[productId]) {
                    order.products[productId] = {};
                }

                if (!order.products[productId][copyId]) {
                    order.products[productId][copyId] = {};
                }

                var p = order.products[productId][copyId];

                p.product = product;
                p.amount = Math.round(amount);

            },
            'orderVariant': function (productId, copyId, variantId) {
                var variant = findVariant(productId, variantId);

                if (!order.products[productId]) {
                    order.products[productId] = {};
                }

                if (!order.products[productId][copyId]) {
                    order.products[productId][copyId] = {};
                }

                var p = order.products[productId][copyId];

                if (!p.variants) {
                    p.variants = {};
                }
                p.variants[variantId] = variant;


            },
            'unOrderProduct': function (productId, copyId) {

                if (!order.products[productId])
                    return;

                if (copyId === undefined) {
                    delete order.products[productId];

                    return;
                }

                if (!order.products[productId][copyId])
                    return;

                delete order.products[productId][copyId];
            },
            'unOrderVariant': function (productId, copyId, variantId) {

                if (!order.products[productId])
                    return;

                if (copyId === undefined) {
                    delete order.products[productId];

                    return;
                }

                if (!order.products[productId][copyId])
                    return;

                if (variantId === undefined) {
                    delete order.products[productId][copyId];

                    return;
                }

                if (!order.products[productId][copyId].variants || !order.products[productId][copyId].variants[variantId])
                    return;

                delete order.products[productId][copyId].variants[variantId];
            },
            'getBasketDetails': function () {
                var number = 0;
                var sum = 0;

                for (var i in order.products) {
                    for (var j in order.products[i]) {
                        var p = order.products[i][j];
                        number++;
                        sum += p.amount * p.product.cost;

                        if (p.variants) {
                            for (var k in p.variants) {
                                var v = p.variants[k];

                                sum += v.cost * p.amount;
                            }
                        }
                    }
                }

                return {
                    'number': number,
                    'sum': sum.money()
                };
            },
            'getVariantBasketDetails': function (productId, copyId) {
                var number = 0;
                var sum = 0;

                for (var i in order.products) {
                    if (i !== productId)
                        continue;

                    for (var j in order.products[i]) {
                        if (j !== copyId)
                            continue;

                        var p = order.products[i][j];

                        if (p.variants) {
                            for (var k in p.variants) {
                                var v = p.variants[k];
                                number++;
                                sum += v.cost * p.amount;
                            }
                        }
                    }
                }

                return {
                    'number': number,
                    'sum': sum.money()
                };
            }
        },
        'shipping': {
            'getMethods': function (cb) {

                if (shippingMethods)
                    return cb(shippingMethods);

                api.delivery.getShippingMethods({}, function (data) {

                    data = data.sort(function (a, b) {
                        return (a.sort < b.sort ? -1 : 1);
                    });

                    for (var i in data) {
                        if (data[i].methods && data[i].methods.length > 1) {
                            data[i].methods = data[i].methods.sort(function (a, b) {
                                return (a.sort < b.sort ? -1 : 1);
                            });

                            var k = 0;
                            for (var j in data[i].methods) {
                                data[i].methods[k].id = "" + k++;
                            }
                        }

                    }

                    shippingMethods = data;
                    cb(data);
                });
            },
            'findMethod': function (id, childId) {
                for (var i in shippingMethods) {
                    if (shippingMethods[i].id === id) {
                        if (childId === undefined)
                            return shippingMethods[i];

                        for (var j in shippingMethods[i].methods) {
                            if (shippingMethods[i].methods[j].id === childId)
                                return shippingMethods[i].methods[j];
                        }
                    }
                }
            },
            'saveShippingInfo': function (model) {
                order.shippingInfo = model;

                order.shippingInfo.name = order.shippingInfo.name.trim();
                order.shippingInfo.phone = order.shippingInfo.phone.trim();
                order.shippingInfo.address = order.shippingInfo.address.trim();
                order.shippingInfo.date = order.shippingInfo.date.trim();

                order.shippingInfo.method = this.findMethod(model.methodId, model.methodChildId);
            },
            'checkShippingInfo': function () {

                if (!shippingMethods || shippingMethods.length === 0) {
                    return true;
                }

                if (!order.shippingInfo.method)
                    return false;

                return true;
            },
            'getShippingInfo': function () {
                if (!order.shippingInfo || !order.shippingInfo.methodId)
                    return false;

                return order.shippingInfo;
            }
        },
        'payment': {
            'getMethods': function (cb) {

                if (paymentMethods)
                    return cb(paymentMethods);

                api.delivery.getPaymentMethods({}, function (data) {

                    data = data.sort(function (a, b) {
                        return (a.sort < b.sort ? -1 : 1);
                    });

                    paymentMethods = data;
                    cb(data);
                });
            },
            'findMethod': function (id) {
                for (var i in paymentMethods) {
                    if (paymentMethods[i].id === id) {
                        return paymentMethods[i];
                    }
                }
            },
            'savePaymentInfo': function (model) {
                order.paymentInfo = model;

                order.paymentInfo.method = this.findMethod(model.methodId);
            },
            'checkPaymentInfo': function () {
                if (!order.paymentInfo.method)
                    return false;

                return true;
            },
            'getPaymentInfo': function () {
                if (!order.paymentInfo || !order.paymentInfo.methodId)
                    return false;

                return order.paymentInfo;
            }
        },
        'checkout': {
            'getInfo': function () {
                var info = [];
                var sum = 0;
                for (var i in order.products) {
                    for (var j in order.products[i]) {
                        var p = order.products[i][j];
                        var item = {};
                        item.number = p.amount;
                        item.name_ru = p.product.name_ru;
                        item.cost = p.product.cost * p.amount;

                        var desc = [];
                        if (p.variants) {
                            for (var k in p.variants) {
                                var v = p.variants[k];
                                desc.push(v.name_ru);

                                item.cost += v.cost * p.amount;
                            }
                        }

                        sum += item.cost;
                        item.cost = item.cost.money();

                        if (desc.length > 0) {
                            item.description_ru = desc.join(', ');
                        } else {
                            item.description_ru = p.product.description_ru;
                        }


                        info.push(item);
                    }
                }

                return {'items': info, 'sum': sum};
            }
        }



    };

});


