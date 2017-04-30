'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.V_RESULT = undefined;
exports.validate = validate;

var _lodash = require('lodash');

const falseFn = function () {
    return false;
};

const V_RESULT = exports.V_RESULT = Symbol('vResult');
// 存储非法验证结果
let pools = [];
function validate(vKey, message, validator) {
    return (target, key, descriptor) => {
        const { set, get, value } = descriptor;
        if ((0, _lodash.isFunction)(set)) {
            descriptor.set = function (data) {
                if ((0, _lodash.isFunction)(set)) {
                    let vResult = check(data, vKey, message, validator);

                    if (vResult.invalid) {
                        pools.push(vResult);
                    }

                    data[V_RESULT] = pools.length ? pools[0] : {};
                    set.call(target, data);
                }
            };
        }
        if ((0, _lodash.isFunction)(get)) {
            descriptor.get = function (...args) {
                return get.apply(target, args);
            };
        }

        return descriptor;
    };
}
function check(data, vKey, message, validator) {
    if ((0, _lodash.isArray)(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            var vResult = validateItem(data[i], vKey, message, validator);
            if (vResult.invalid) return vResult;
        }
        return {};
    } else if ((0, _lodash.isObject)(data)) {
        return validateItem(data, vKey, message, validator);
    }
}
/**
 * @return {Object} return unified object for user
 */
function validateItem(item, vKey, message, validator) {
    validator = (0, _lodash.isFunction)(validator) ? validator : falseFn;
    let v;

    if ((0, _lodash.isObject)(item) && item[vKey]) {
        v = item[vKey];
    } else if ((0, _lodash.isString)(item)) {
        v = item;
    }

    return !validator(v) ? {
        invalid: true,
        message: message,
        invalidKey: vKey
    } : {};
}