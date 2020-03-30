import { AxiosRequestConfig } from "../types";
import { isPlainObject, deepMerge } from "../helpers/util";
// 合并策略函数的map
const strats = Object.create(null)

// 默认合并 val2有值就取val2, 否则取val1
function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1
}
// 只取val2的值 的合并策略
function fromVal2Strat(val1: any, val2: any): any {
    // if (typeof val2 !== 'undefined') {
    //     return val2
    // }
    return val2
}
function deepMergeStrat(val1: any, val2: any): any {
    // 如果val2是一个对象调用deepMerge方法
    if (isPlainObject(val2)) {
        return deepMerge(val1, val2)
        // 如果val2不是对象但是val2存在，那就直接返回val2
    } else if (typeof val2 !== 'undefined') {
        return val2
    } else if (isPlainObject(val1)) {
        return deepMerge(val1)
    } else {
        return val1
    }
}

// 定义这三个字段合并策略函数指向 fromVal2Strat
const stratKeysFromVal2 = ['data', 'url', 'params']
stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat
})
// 定义headers字段，这里实行深拷贝
const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
    strats[key] = deepMergeStrat
})
// 合并配置的方法
export default function mergeConfig(config1: AxiosRequestConfig, config2?: AxiosRequestConfig): AxiosRequestConfig {
    if (!config2) {
        config2 = {}
    }
    // 创建一个config空对象 承接合并的结果
    const config = Object.create(null)
    for (let key in config2) {
        mergeField(key)
    }
    for (let key in config1) {
        if (!config2[key]) {
            mergeField(key)
        }
    }
    // 定义一个合并方法
    function mergeField(key: string): void {
        // 如果没有['data', 'url', 'params']这些key 那就执行第一种合并策略
        const strat = strats[key] || defaultStrat
        config[key] = strat(config1[key], config2![key])
    }
    return config
}