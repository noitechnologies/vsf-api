"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const newsletter_1 = __importDefault(require("../abstract/newsletter"));
const util_1 = require("./util");
class NewsletterProxy extends newsletter_1.default {
    constructor(config, req) {
        const Magento1Client = require('magento1-vsbridge-client').Magento1Client;
        super(config, req);
        this.api = Magento1Client(util_1.multiStoreConfig(config.magento1.api, req));
    }
    subscribe(emailAddress) {
        return this.api.newsletter.subscribe(emailAddress);
    }
    unsubscribe(customerToken) {
        return this.api.newsletter.unsubscribe(customerToken);
    }
}
module.exports = NewsletterProxy;
//# sourceMappingURL=newsletter.js.map