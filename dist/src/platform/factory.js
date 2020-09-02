'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class PlatformFactory {
    constructor(app_config, req = null) {
        this.config = app_config;
        this.request = req;
    }
    getAdapter(platform, type, ...constructorParams) {
        let AdapterClass = require(`./${platform}/${type}`);
        if (!AdapterClass) {
            throw new Error(`Invalid adapter ${platform} / ${type}`);
        }
        else {
            let adapter_instance = new AdapterClass(this.config, this.request, ...constructorParams);
            if ((typeof adapter_instance.isValidFor === 'function') && !adapter_instance.isValidFor(type)) {
                throw new Error(`Not valid adapter class or adapter is not valid for ${type}`);
            }
            return adapter_instance;
        }
    }
}
exports.default = PlatformFactory;
//# sourceMappingURL=factory.js.map