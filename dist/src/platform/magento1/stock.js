"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stock_1 = __importDefault(require("../abstract/stock"));
const util_1 = require("./util");
class StockProxy extends stock_1.default {
    constructor(config, req) {
        const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
        super(config, req);
        this.api = Magento1Client(util_1.multiStoreConfig(config.magento1.api, req));
    }
    check(data) {
        return this.api.stock.check(data.sku);
    }
}
module.exports = StockProxy;
//# sourceMappingURL=stock.js.map