import { isString, isObject, isArray, isFunction } from 'lodash'

const falseFn = function () { return false }

export const V_RESULT = Symbol('vResult')
// 存储非法验证结果
let pools = []
export function validate(vKey, message, validator) {
    return (target, key, descriptor) => {
        const { set, get, value } = descriptor
        if (isFunction(set)) {
            descriptor.set = function (data) {
                if (isFunction(set)) {
                    let vResult = check(data, vKey, message, validator)
                    
                    if (vResult.invalid) {
                        pools.push(vResult)
                    }
                    
                    data[V_RESULT] = pools.length ? pools[0] : {}
                    set.call(target, data)
                }
            }
        }
        if (isFunction(get)) {
            descriptor.get = function (...args) {
                return get.apply(target, args)
            }
        }
        
        return descriptor
    }
}
function check(data, vKey, message, validator) {
    if (isArray(data)) {
        for (var i = 0, len = data.length; i < len; i++) {
            var vResult = validateItem(data[i], vKey, message, validator)
            if (vResult.invalid) return vResult
        }
        return {}
    } else if (isObject(data)) {
        return validateItem(data, vKey, message, validator)
    }
}
/**
 * @return {Object} return unified object for user
 */
function validateItem(item, vKey, message, validator) {
    validator = isFunction(validator) ? validator : falseFn
    let v

    if (isObject(item) && item[vKey]) {
        v = item[vKey]
    } else if (isString(item)) {
        v = item
    }

    return !validator(v) ? {
        invalid: true,
        message: message,
        invalidKey: vKey
    } : {}
}

