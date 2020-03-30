
import { isDate, isPlainObject, isURLSearchParams } from './util'

interface URLOrigin {
    protocol: string
    host: string
}

function encode(val: string): string {
    // 将url上的特殊字符再转化回来
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/ig, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/ig, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/ig, '[')
        .replace(/%5D/ig, ']')
}
export function buildURL(url: string, params?: any, paramsSerializer?: (params: any) => string): string {
    // 如果不传params直接返回url
    if (!params) {
        // 处理一下存在hash的情况
        // if (url.indexOf('#') !== -1) {
        //     url = url.slice(0, url.indexOf('#'))
        // }
        return url
    }
    let serializedParams

    // 如果用户自定义params的解析规则, 那么就使用自定义的,否则使用默认解析params
    if (paramsSerializer) {
        serializedParams = paramsSerializer(params)
        // 如果是一个URLSearchParams的对象，那么调用params的toString方法即可
    } else if (isURLSearchParams(params)) {
        serializedParams = params.toString()
    } else {
        // 键值对数字
        const parts: string[] = []

        // 返回一个所有元素为字符串的数组,其元素来自于从给定的object上面直接枚举的属性
        // 不会访问原型链上的值,只遍历自身的, for in 会去遍历原型链上的值
        Object.keys(params).forEach((key) => {
            // 遍历对象的键 获取到对象的值
            const val = params[key]
            // 判定值如果是null 那就要进入下一个遍历,null值不保存
            if (val === null || typeof val === 'undefined') {
                return
            }
            let values = []
            // 判断值是不是为数组,如果是数组,则需要再遍历数组中的值
            if (Array.isArray(val)) {
                // 如果是数组遍历数组中的值
                values = val
                key += '[]'
            } else {
                // 不是数组的话规范成一个数组
                values = [val]
            }
            // 这样拿到的一定是一个数组的值 val 一定是数组,.然后统一处理, 数组内是否是对象或者日期等其他类型
            values.forEach((val) => {
                // 如果是一个日期类型
                if (isDate(val)) {
                    // toISOString方法返回一个 iso格式的字符串 YYYY-MM-DDTHH:mm:ss.sssZ 最后还加一个Z
                    val = val.toISOString()
                } else if (isPlainObject(val)) {
                    // 如果是对象, 将对象转换为字符串
                    val = JSON.stringify(val)
                }
                // 在数组中存放一个个键值对形式的字符串
                parts.push(`${encode(key)}=${encode(val)}`)
            })
        })
        serializedParams = parts.join('&')
    }
    // 让数组变成一个&连接的字符串 然后再判断url中是否含有？
    if (serializedParams) {
        // 找url中是否存在hash标识
        const markIndex = url.indexOf('#')
        // 如果存在hash标识那么就删除 #
        if (markIndex !== -1) {
            url = url.slice(0, markIndex)
        }
        // 判断url中是否含有? 如果含有? 那么就拼接一个& 再拼接字符串键值对,这里 +-运算要优先于三元运算,所以三元内的计算要括号起来
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
    }
    return url
}
// 判断url是否是一个绝对地址
export function isAbsoluteURL(url: string): boolean {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}
// 封装拼接第二个url地址到baseURL上的函数
export function combineURL(baseURL: string, relativeURL?: string): string {
    // 如果存在第二个参数，那么就进行拼接, 将第一个的尾部的 1个或多个/ 去掉 然后 再添加一个/, 再把第二个参数开头的/去掉,
    // 拿到最后拼接的结果
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

// 判断是否同源
export function isURLSameOrigin(requestURL: string): boolean {
    // 当前页面的protocol 和host
    const currentOrigin = resolveURL(window.location.href)
    const parsedOrigin = resolveURL(requestURL)
    // 判断当前页面的url协议和url端口是否和请求的url的协议和端口相等
    return (parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host)
}

// 创建a标签节点 用来判断是否同源
const urlParsingNode = document.createElement('a')

// 利用a标签来解析 url内的属性
function resolveURL(url: string): URLOrigin {
    urlParsingNode.setAttribute('href', url)
    // protocol 设置或返回当前 URL 的协议。  post设置或返回主机名和当前 URL 的端口号。
    const { protocol, host } = urlParsingNode
    return {
        protocol,
        host
    }
}