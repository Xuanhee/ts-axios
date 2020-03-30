import { isPlainObject } from './util'
// 请求转换data数据 转成字符串
export function transformRequest(data: any): any {
    if (isPlainObject(data)) {
        return JSON.stringify(data)
    }
    return data
}

// 如果返回的data类型是字符串,那么就把他转换成为json对象
export function transformResponse(data: any): any {
    if (typeof data === 'string') {
        // 如果是字符串类型,那就试着去转换成json即便转化失败也不影响,所有用try catch
        try {
            data = JSON.parse(data)
        } catch (e) {
            //do nothing
        }
    }
    // 不管是否转换成功 都返回
    return data
}