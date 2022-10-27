/* eslint-disable */
'use strict';

var server = require('server');

server.get('Billing', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var Transaction = require('dw/system/Transaction');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var basketHelpers = require('*/cartridge/scripts/helpers/basketHelpers');
    var currentBasket = basketHelpers.getCurrentOrNewBasket();
    Transaction.wrap(function () {
        cartHelper.addProductToCart(currentBasket, '300272NL10089662', 10);
        COHelpers.copyShippingAddressToShipment(
            {
                firstName: 'Test',
                lastName: 'Consultant',
                address1: '123 N Main St',
                city: 'Chicago',
                postalCode: '12345',
                countryCode: 'US',
                stateCode: 'IL',
                phone: '3334445555'
            },
            currentBasket.defaultShipment
        );
        COHelpers.copyBillingAddressToBasket(currentBasket.defaultShipment.shippingAddress, currentBasket);
        cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
    });

    basketCalculationHelpers.calculateTotals(currentBasket);

    res.redirect(URLUtils.url('Checkout-Begin', 'stage', 'payment'));
    next();
});

server.get('Test', function (req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var a = OrderMgr.createOrderNo();
    var b = OrderMgr.createOrderNo();
    var c = OrderMgr.createOrderNo();
    var d = 1;
});

server.get('IPSEntry', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var loginRequired = req.querystring.login === '1';
    if (loginRequired) {
        if (!req.currentCustomer.profile) {
            if (req.querystring.args) {
                req.session.privacyCache.set('args', req.querystring.args);
            }

            var target = URLUtils.url('Test-IPSEntry').toString();

            res.redirect(URLUtils.url('Login-Show', 'rurl', target));

            next();
            return;
        }
    }

    res.render('ips/testHarnessPage');

    next();
});

server.get(
    'IPSReturn',
    server.middleware.https,
    function (req, res, next) {
        var numberOfItems = 0;
        var order = {};
        var params = req.querystring;
        order.checkout_status = params.checkout_status;
        order.error_message = params.error_message;
        order.order_number = params.order_number;
        order.txn_id = params.txn_id;
        order.tax_amount = params.tax_amount;
        order.shipping_amount = params.shipping_amount;
        order.order_total = params.order_total;
        order.items = [];

        Object.keys(params).forEach(function (param) {
            if (param.indexOf('item_partid') === 0) {
                numberOfItems++;
            }
        });

        for (var i = 1; i <= numberOfItems; i++) {
            if (params['item_partid' + i]) {
                var item = {};
                item['item_partid'] = params['item_partid' + i]; // eslint-disable-line dot-notation
                item['Item_quantity'] = params['Item_quantity' + i]; // eslint-disable-line dot-notation
                item['Item_unit_price'] = params['Item_unit_price' + i]; // eslint-disable-line dot-notation
                order.items.push(item);
            }
        }
        res.render('ips/testIPSExit', {
            order: order,
            pageType: 'IPS Return Test Page'
        });

        next();
    }
);

server.get(
    'IPSCancel',
    server.middleware.https,
    function (req, res, next) {
        res.render('ips/testIPSExit', {
            pageType: 'IPS Cancel Test Page'
        });

        next();
    }
);

server.get(
    'IPSDecline',
    server.middleware.https,
    function (req, res, next) {
        res.render('ips/testIPSExit', {
            pageType: 'IPS Decline Test Page'
        });

        next();
    }
);

server.get(
    'IPSDeny',
    server.middleware.https,
    function (req, res, next) {
        res.render('ips/testIPSExit', {
            pageType: 'IPS Deny Test Page'
        });

        next();
    }
);

server.get(
    'IPSException',
    server.middleware.https,
    function (req, res, next) {
        res.render('ips/testIPSExit', {
            pageType: 'IPS Exception Test Page',
            message: req.querystring.error_message
        });

        next();
    }
);

server.get(
    'IPSIPN',
    function (req, res, next) {
        var Logger = require('dw/system/Logger');
        var testLogger = Logger.getLogger('test', 'test');
        var params = {};
        request.httpParameterMap.parameterNames.toArray().forEach(function (pname) {
            params[pname] = request.httpParameterMap.get(pname).value;
        });
        testLogger.info(params);

        res.json(params);

        next();
    }
);

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var CustomerMgr = require('dw/customer/CustomerMgr');
var orderOnBehalfHelpers = require('*/cartridge/scripts/orderOnBehalf/orderOnBehalfHelpers');
var Transaction = require('dw/system/Transaction');
server.get(
    'CSRSessionStart',
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        session.custom.userType = 'csr';

        res.redirect(URLUtils.url('Account-Show').toString());

        next();
    }
);

server.get(
    'StartEmployeeSession',
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        session.custom.userType = 'employee';

        res.redirect(URLUtils.url('Account-Show').toString());

        next();
    }
);

server.get(
    'StopEmployeeSession',
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        session.custom.userType = 'ibc';

        res.redirect(URLUtils.url('Account-Show').toString());

        next();
    }
);

server.get(
    'CSRSessionClose',
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        var OrderOnBehalfHelpers = require('*/cartridge/scripts/orderOnBehalf/orderOnBehalfHelpers');

        session.custom.userType = 'ibc';
        OrderOnBehalfHelpers.clearConsultantContext();

        res.redirect(URLUtils.url('Account-Show').toString());

        next();
    }
);

server.get(
    'OOBOClearContext',
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        orderOnBehalfHelpers.clearConsultantContext();

        res.redirect(URLUtils.url('Account-Show').toString());

        next();
    }
);

server.get(
    'ExportStatusFailed',
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var Order = require('dw/order/Order');
        var Transaction = require('dw/system/Transaction');
        if (req.querystring.orderId) {
            var order = OrderMgr.getOrder(req.querystring.orderId);
            Transaction.wrap(function () {
                order.exportStatus = Order.EXPORT_STATUS_FAILED;
            });
            res.print('Order Export Status has changed to FAILED for the order ' + req.querystring.orderId);
        } else {
            res.print('Order not found ' + req.querystring.orderId);
        }

        next();
    }
);

server.get(
    'ExportStatusExported',
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var Order = require('dw/order/Order');
        var Transaction = require('dw/system/Transaction');
        if (req.querystring.orderId) {
            var order = OrderMgr.getOrder(req.querystring.orderId);
            Transaction.wrap(function () {
                order.exportStatus = Order.EXPORT_STATUS_EXPORTED;
            });
            res.print('Order Export Status has changed to EXPORTED for the order ' + req.querystring.orderId);
        } else {
            res.print('Order not found ' + req.querystring.orderId);
        }

        next();
    }
);

server.get(
    'GetBasketInfo',
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var order = OrderMgr.getOrder('13360861');
        var _ = require('underscore');

        var typeMap = {
            8: 'Boolean',
            6: 'Date',
            11: 'Datetime',
            12: 'Email',
            31: 'Enum of Int',
            33: 'Enum of String',
            5: 'HTML',
            7: 'Image',
            1: 'Int',
            9: 'Money',
            2: 'Number',
            13: 'Password',
            10: 'Quantity',
            21: 'Set of Int',
            22: 'Set of Number',
            23: 'Set of Strings',
            3: 'String',
            4: 'Text'
        };

        var basketHelpers = require('*/cartridge/scripts/helpers/basketHelpers');
        var basket = basketHelpers.getCurrentOrNewBasket();
        var basketMeta = basket.describe();
        var basketDefs = basketMeta.attributeDefinitions;
        var basketDf = [];
        for (var i = 0; i < basketDefs.length; i++) {
            var attr = basketDefs[i];
            if (attr.system) continue;
            var at = {
                system: attr.system,
                ID: attr.ID,
                valueTypeCode: typeMap[attr.valueTypeCode]
            };
            basketDf.push(at);
        }
        var ba = _.indexBy(basketDf, 'ID');

        var orderMeta = order.describe();
        var orderDefs = orderMeta.attributeDefinitions;
        var orderDf = [];
        for (var i = 0; i < orderDefs.length; i++) {
            var attr = orderDefs[i];
            if (attr.system) continue;
            var at = {
                system: attr.system,
                ID: attr.ID,
                valueTypeCode: typeMap[attr.valueTypeCode]
            };
            orderDf.push(at);
        }
        var oa = _.indexBy(orderDf, 'ID');

        var html = '<style>table {border-collapse: collapse;} td {border:1px solid black;padding: 3px;}</style><table>';
        var attrs = {};
        Object.keys(oa).forEach(function (key) {
            var type = oa[key].valueTypeCode;
            var attrId = oa[key].ID;
            attrs[attrId] = {
                ID: attrId,
                orderType: type
            };
            if (ba[key]) attrs[attrId].basketType = ba[key].valueTypeCode;
            if (ba[key] && ba[key].valueTypeCode !== type) attrs[attrId].diffType = true;
        });
        Object.keys(ba).forEach(function (key) {
            var type = ba[key].valueTypeCode;
            var attrId = ba[key].ID;
            attrs[attrId] = {
                ID: attrId,
                basketType: type
            };
            if (oa[key]) attrs[attrId].orderType = oa[key].valueTypeCode;
            if (oa[key] && oa[key].valueTypeCode !== type) attrs[attrId].diffType = true;
        });
        html = html + '<tr><th>ID</th><th>Basket</th><th>Order</th></tr>';
        Object.keys(attrs).sort(function (a, b) {
            return a.basketType && a.orderType && b.basketType && b.orderType && a.ID < b.ID;
        }).forEach(function (key) {
            var attr = attrs[key];
            var ot = attr.orderType ? attr.orderType : '';
            var bt = attr.basketType ? attr.basketType : '';
            var difftype = attr.diffType ? 'style="color: #1e1e1e"' : '';
            var attrId = attr.ID;

            html = html + '<tr ' + difftype + '><td>' + attrId + '</td><td>' + bt + '</td><td>' + ot + '</td></tr>';
        });
        html = html + '</table>';
        res.print(html);
        next();
    }
);

server.get('GetApproachingDiscounts', function (req, res, next) {
    var PromoPointsBUHelpers = require('*/cartridge/scripts/helpers/promotionPointsOrBasicUnitHelpers');
    var approachingDiscounts = [];
    var cartModel;

    if (session.custom.isOoboSession) {
        var OcapiModel = require('*/cartridge/scripts/opal/ocapiProxy/models/ocapiModel');
        cartModel = OcapiModel.getCartModel(session.custom.currentBasket);
    } else {
        var BasketMgr = require('dw/order/BasketMgr');
        var CartModel = require('*/cartridge/models/cart');
        var currentBasket = BasketMgr.getCurrentBasket();
        cartModel = new CartModel(currentBasket);
    }

    if (PromoPointsBUHelpers.isPointsEnabled()) {
        approachingDiscounts = cartModel.approachingPointDiscount;
    } else if (PromoPointsBUHelpers.isBasicUnitEnabled()) {
        approachingDiscounts = cartModel.approachingBusinessUnitDiscount;
    } else {
        approachingDiscounts = cartModel.approachingDiscounts;
    }

    res.json(approachingDiscounts);

    next();
});

server.get('Logout', function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    CustomerMgr.logoutCustomer(false);
});

server.get('DebugOOBO', function (req, res, next) {
    var ooboObj = {};
    var OpalCustomerMgr = require('*/cartridge/scripts/opal/models/customerMgr');
    var OcapiModel = require('*/cartridge/scripts/opal/ocapiProxy/models/ocapiModel');
    var SessionHelpers = require('org_marykayintouch/cartridge/scripts/helpers/sessionHelpers');
    // session.custom.contextConsultantNumber = 'testconsultant1';
    var contextCustomer = OpalCustomerMgr.getContextCustomer().raw;
    var baskets = OcapiModel.getCustomerBaskets(contextCustomer.ID);
    baskets = baskets ? baskets.toArray() : [];
    var storefrontBaskets = baskets.filter(function (b) { return !b.agent_basket; }).length;
    var agentBaskets = baskets.filter(function (b) { return b.agent_basket; }).length;

    // ooboObj.session = JSON.parse(SessionHelpers.serializeSessionData());
    // ooboObj.session.orderTypeModel = ooboObj.session.orderTypeModel ? JSON.parse(ooboObj.session.orderTypeModel) : {};
    ooboObj.currentBasket = session.custom.currentBasket;
    // var currentBasket = OcapiModel.getBasket(session.custom.currentBasket);
    // ooboObj.agentBasket = currentBasket.agent_basket;
    ooboObj.orderType = session.custom.orderType;
    ooboObj.orderSourceId = session.custom.orderSource;
    ooboObj.contextConsultantNumber = session.custom.contextConsultantNumber;
    ooboObj.baskets = baskets.map(function(b) {
        return {
            basket_id: b.basket_id,
            agent: b.agent_basket,
            updatedBy: (Object.hasOwnProperty.call(b, 'c_lastUpdatedBy') ? b.c_lastUpdatedBy : 'N/A'),
            createdBy: (Object.hasOwnProperty.call(b, 'c_createdByName') ? b.c_createdByName : 'N/A'),
        };
    });
    ooboObj.storefrontBaskets = storefrontBaskets;
    ooboObj.agentBaskets = agentBaskets;
    ooboObj.contextCustomerID = contextCustomer.ID;
    ooboObj.sessionCustomerID = customer.ID;
    ooboObj.isOoboSession = session.custom.isOoboSession;
    ooboObj.ooboBasketType = session.custom.ooboBasketType;

    ooboObj.baskets.forEach(function (basket_id) {
        if (session.custom.currentBasket !== basket_id) {
            // OcapiModel.deleteBasket(basket_id);
        }
        // OcapiModel.deleteBasket(basket_id);
    });

    // var sourceLineItemCtnr = OcapiModel.getOrder('00000401');
    // ooboObj.notes = OcapiModel.getLineItemCtnrNotes(sourceLineItemCtnr.notes.link);

    res.json(ooboObj);
    next();
});

server.get('Subcategories', function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var collections = require('*/cartridge/scripts/util/collections');
    var catID = req.querystring.cgid;
    if (!catID) return;
    var categories = CatalogMgr.getCategory(catID).getOnlineSubCategories();
    var cats = collections.map(categories, function (category) {
        return {
            ID: category.ID,
            name: category.displayName
        };
    });

    res.json({
        num: cats.length,
        cats: cats
    });
    next();
});

module.exports = server.exports();
