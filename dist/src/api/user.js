"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../lib/util");
const express_1 = require("express");
const factory_1 = __importDefault(require("../platform/factory"));
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const lodash_1 = require("lodash");
const Ajv = require('ajv'); // json validator
const fs = require('fs');
const path = require('path');
function addUserGroupToken(config, result) {
    /**
     * Add group id to token
     */
    const data = {
        group_id: result.group_id,
        id: result.id,
        user: result.email
    };
    result.groupToken = jwt_simple_1.default.encode(data, config.authHashSecret ? config.authHashSecret : config.objHashSecret);
}
function validateAddresses(currentAddresses = [], newAddresses = []) {
    for (let address of newAddresses) {
        if (!address.customer_id && !address.id) {
            continue;
        }
        else {
            const existingAddress = currentAddresses.find((existingAddress) => existingAddress.id === address.id && existingAddress.customer_id === address.customer_id);
            if (!existingAddress) {
                return 'Provided invalid address.id or address.customer_id';
            }
        }
    }
}
exports.default = ({ config, db }) => {
    let userApi = express_1.Router();
    const _getProxy = (req) => {
        const platform = config.platform;
        const factory = new factory_1.default(config, req);
        return factory.getAdapter(platform, 'user');
    };
    /**
     * POST create an user
     */
    userApi.post('/create', (req, res) => {
        const ajv = new Ajv();
        const userRegisterSchema = require('../models/userRegister.schema.json');
        let userRegisterSchemaExtension = {};
        if (fs.existsSync(path.resolve(__dirname, '../models/userRegister.schema.extension.json'))) {
            userRegisterSchemaExtension = require('../models/userRegister.schema.extension.json');
        }
        const validate = ajv.compile(lodash_1.merge(userRegisterSchema, userRegisterSchemaExtension));
        if (!validate(req.body)) { // schema validation of upcoming order
            util_1.apiStatus(res, validate.errors, 400);
            return;
        }
        const userProxy = _getProxy(req);
        userProxy.register(req.body).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * POST login an user
     */
    userApi.post('/login', (req, res) => {
        const userProxy = _getProxy(req);
        userProxy.login(req.body).then((result) => {
            /**
            * Second request for more user info
            */
            util_1.apiStatus(res, result, 200, { refreshToken: util_1.encryptToken(jwt_simple_1.default.encode(req.body, config.authHashSecret ? config.authHashSecret : config.objHashSecret), config.authHashSecret ? config.authHashSecret : config.objHashSecret) });
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * POST refresh user token
     */
    userApi.post('/refresh', (req, res) => {
        const userProxy = _getProxy(req);
        if (!req.body || !req.body.refreshToken) {
            return util_1.apiStatus(res, 'No refresh token provided', 500);
        }
        try {
            const decodedToken = jwt_simple_1.default.decode(req.body ? util_1.decryptToken(req.body.refreshToken, config.authHashSecret ? config.authHashSecret : config.objHashSecret) : '', config.authHashSecret ? config.authHashSecret : config.objHashSecret);
            if (!decodedToken) {
                return util_1.apiStatus(res, 'Invalid refresh token provided', 500);
            }
            userProxy.login(decodedToken).then((result) => {
                util_1.apiStatus(res, result, 200, { refreshToken: util_1.encryptToken(jwt_simple_1.default.encode(decodedToken, config.authHashSecret ? config.authHashSecret : config.objHashSecret), config.authHashSecret ? config.authHashSecret : config.objHashSecret) });
            }).catch(err => {
                util_1.apiError(res, err);
            });
        }
        catch (err) {
            util_1.apiError(res, err);
        }
    });
    /**
     * POST resetPassword (old, keep for backward compatibility)
     */
    userApi.post('/resetPassword', (req, res) => {
        const userProxy = _getProxy(req);
        if (!req.body.email) {
            return util_1.apiStatus(res, 'Invalid e-mail provided!', 500);
        }
        userProxy.resetPassword({ email: req.body.email, template: 'email_reset', websiteId: 1 }).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * POST resetPassword
     */
    userApi.post('/reset-password', (req, res) => {
        const userProxy = _getProxy(req);
        const { storeCode } = req.query;
        const websiteId = storeCode ? config.storeViews[storeCode].websiteId : undefined;
        if (!req.body.email) {
            return util_1.apiStatus(res, 'Invalid e-mail provided!', 500);
        }
        userProxy.resetPassword({ email: req.body.email, template: 'email_reset', websiteId }).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * GET  an user
     */
    userApi.get('/me', (req, res) => {
        const userProxy = _getProxy(req);
        const token = util_1.getToken(req);
        userProxy.me(token).then((result) => {
            addUserGroupToken(config, result);
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * GET  an user order history
     */
    userApi.get('/order-history', (req, res) => {
        const userProxy = _getProxy(req);
        const token = util_1.getToken(req);
        userProxy.orderHistory(token, req.query.pageSize || 20, req.query.currentPage || 1).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiError(res, err);
        });
    });
    /**
     * POST for updating user
     */
    userApi.post('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const ajv = new Ajv();
        const userProfileSchema = require('../models/userProfileUpdate.schema.json');
        let userProfileSchemaExtension = {};
        if (fs.existsSync(path.resolve(__dirname, '../models/userProfileUpdate.schema.extension.json'))) {
            userProfileSchemaExtension = require('../models/userProfileUpdate.schema.extension.json');
        }
        const validate = ajv.compile(lodash_1.merge(userProfileSchema, userProfileSchemaExtension));
        if (req.body.customer && req.body.customer.groupToken) {
            delete req.body.customer.groupToken;
        }
        if (!validate(req.body)) {
            console.dir(validate.errors);
            util_1.apiStatus(res, validate.errors, 500);
            return;
        }
        const userProxy = _getProxy(req);
        const token = util_1.getToken(req);
        try {
            let { website_id, addresses } = yield userProxy.me(token);
            const { customer } = req.body;
            const validationMessage = validateAddresses(addresses, customer.addresses);
            if (validationMessage) {
                return util_1.apiStatus(res, validationMessage, 403);
            }
            const result = yield userProxy.update({
                token,
                body: {
                    customer: Object.assign(Object.assign({}, customer), { website_id })
                }
            });
            addUserGroupToken(config, result);
            util_1.apiStatus(res, result, 200);
        }
        catch (err) {
            util_1.apiStatus(res, err, 500);
        }
    }));
    /**
     * POST for changing user's password (old, keep for backward compatibility)
     */
    userApi.post('/changePassword', (req, res) => {
        const userProxy = _getProxy(req);
        const token = util_1.getToken(req);
        userProxy.changePassword({ token, body: req.body }).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiStatus(res, err, 500);
        });
    });
    /**
     * POST for changing user's password
     */
    userApi.post('/change-password', (req, res) => {
        const userProxy = _getProxy(req);
        const token = util_1.getToken(req);
        userProxy.changePassword({ token, body: req.body }).then((result) => {
            util_1.apiStatus(res, result, 200);
        }).catch(err => {
            util_1.apiStatus(res, err, 500);
        });
    });
    /**
     * POST for changing user's password after reset password with the token
     */
    userApi.post('/create-password', (req, res) => {
        if (!req.body.email) {
            return util_1.apiStatus(res, 'email not provided', 500);
        }
        if (!req.body.resetToken) {
            return util_1.apiStatus(res, 'resetToken not provided', 500);
        }
        if (!req.body.newPassword) {
            return util_1.apiStatus(res, 'newPassword not provided', 500);
        }
        const userProxy = _getProxy(req);
        userProxy
            .resetPasswordUsingResetToken(req.body)
            .then(result => {
            util_1.apiStatus(res, result, 200);
        })
            .catch(err => {
            util_1.apiStatus(res, err, 500);
        });
    });
    return userApi;
};
//# sourceMappingURL=user.js.map