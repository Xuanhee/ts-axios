import { isPlainObject, deepMerge } from './util'
import { Method } from '../types'
// 规范化headers的属性
function normalizeHeaderName(headers: any, normalizeName: string): void {
    if (!headers) return
    // 遍历headers内的属性
    Object.keys(headers).forEach((name) => {
        // 判断如果说headers本身的这个属性就和传入属性不相等,但是两个都大写的话又相等,那就让他们统一名称为传入的
        if (name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()) {
            headers[normalizeName] = headers[name]
            // 然后删除掉原来那个属性
            delete headers[name]
        }

    })
}
// 处理headers 为headers添加content-type
export function processHeaders(headers: any, data: any): any {
    // 引入规范化headers的函数, 让content-type 统一变成首字母大写
    normalizeHeaderName(headers, 'Content-Type')
    // 判断是不是一个普通对象 然后没有配置content-type的时候去配置content-type
    if (isPlainObject(data)) {
        // 判断有请求头,并且没有配置content-type,那么就设置content-type
        if (headers && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json; charset=utf-8'
        }
    }
    return headers
}

// 处理responseHeaders 这个参数默认是用\r\n分隔开的字符串,需要将它转换为对象
export function parseHeaders(headers: string): any {
    // 创建一个空对象, 使用Object.create(null) 创建的对象时一个没有原型的对象
    let parsed = Object.create(null)
    // 如果headers是空就直接返回
    if (!headers) {
        return parsed
    }
    // 分隔成一行一行的字符串数组,然后遍历获取每个元素的值, 每个元素中都含有: 那么可以获取到键值
    headers.split('\r\n').forEach((line) => {
        // 解构拿到:左右两边的值 左边是键 右边是值
        let [key, ...vals] = line.split(':')
        // 判断key是否为空 为空则进入下一次循环
        if (!key) {
            return
        }
        // 让key 变成小写
        key = key.trim().toLowerCase()
        // 都去掉空白字符
        const val = vals.join(':').trim()
        // 然后给对象添加属性值, key为属性名, val 为属性值  让变量作为属性需要用[]
        parsed[key] = val
    })
    return parsed
}

export function flattenHeaders(headers: any, method: Method): any {
    if (!headers) {
        return headers
    }
    // 将headers做处理,清除common 和 method属性 重新赋值到headers上面
    headers = deepMerge(headers.common, headers[method], headers)
    const methodsToDelete = ['delete', 'put', 'post', 'get', 'patch', 'options', 'head', 'common']
    // 删除headers中这些字段的值
    methodsToDelete.forEach(method => {
        delete headers[method]
    })
    return headers
}