
// 工具类函数封装

// Object.prototype.toString方法返回一个表示该对象的字符串
// object 就是调用的对象
const toString = Object.prototype.toString
// 判断是不是date类型
export function isDate(val: any): val is Date {
    // call指定传入参数为当前this date类型调用toString 会返回[Object Date]
    return Object.prototype.toString.call(val) === '[object Date]'
}
// 判断是不是对象
// export function isObject(val: any): boolean {
//     // null 也属于object 所以要先判断值是否为null
//     return val !== null && typeof val === 'object'
// }
// 判断是不是普通对象
export function isPlainObject(val: any): val is Object {
    return Object.prototype.toString.call(val) === '[object Object]'
}
// 判断是不是一个FormData对象
export function isFormData(val: any): val is FormData {
    return typeof val !== 'undefined' && val instanceof FormData
}
// 判断是不是一个URLSearchParams对象
export function isURLSearchParams(val: any): val is URLSearchParams {
    return typeof val !== 'undefined' && val instanceof URLSearchParams
}

// 定义混合方法,将两个参数合并成一个参数
export function extend<T, U>(to: T, from: U): T & U {
    // 将所有from的值都添加到to上
    for (let key in from) {
        (to as T & U)[key] = from[key] as any
    }
    return to as T & U
}

// 深拷贝 参数可能是一个或者多个, 用剩余参数的方式表示未知参数
export function deepMerge(...objs: any[]): any {
    // 创建一个空对象 用来合并所有传入对象
    const result = Object.create(null)
    // obj的值是一个对象
    objs.forEach(obj => {
        // 判断obj是不是存在
        if (obj) {
            // 拿到所有对象的键的数组, 通过遍历键再拿到值
            Object.keys(obj).forEach(key => {
                // 拿到对象内每个属性的值
                const val = obj[key]
                // 判断这个对象的值是否是一个对象
                if (isPlainObject(val)) {
                    // 判断result[key] 是否已经存在
                    if (isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val)
                    } else {
                        result[key] = deepMerge(val)
                    }
                } else {
                    result[key] = val
                }
            })
        }
    })
    return result
}