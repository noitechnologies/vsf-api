"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../lib/util");
const express_1 = require("express");
module.exports = ({ config }) => {
    let mcApi = express_1.Router();
    var Razorpay = require('razorpay');
    mcApi.post('/order', (req, res) => {
        let orderData = req.body;
        if (!orderData) {
            util_1.apiStatus(res, 'Internal Server Error!', 500);
            return;
        }
        var rzp = new Razorpay({
            'key_id': config.extensions.razorpay.key,
            'key_secret': config.extensions.razorpay.keySecret
        });
        rzp.orders.create(orderData, (err, order) => {
            if (err) {
                util_1.apiStatus(res, err, 500);
            }
            else {
                util_1.apiStatus(res, order, 200);
            }
        });
    });
    return mcApi;
};
//# sourceMappingURL=index.js.map