// 导入定义的请求配置
import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types/index'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'
// 发送请求的函数 参数是 AxiosRequestConfig 类型的 返回一个Promise类型
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
    // 发送请求前调用检测函数 是否使用过cancelToken，是否请求过取消
    throwIfCancellationRequested(config)
    processConfig(config)
    // TODO
    return xhr(config).then((res) => {
        // 这里不做逻辑,只拿封装的函数, 将处理data后的 res传递出去
        return transformResponseData(res)
    }, e => {
        if (e && e.response) {
            e.response = transformResponseData(e.response)
        }
        return Promise.reject(e)
    })
}
// 处理config内的值
function processConfig(config: AxiosRequestConfig): void {
    // 调用处理url的函数
    config.url = transformUrl(config)
    // 处理headers要用到data,但是下面的data会转换成字符串,所以必须要在转换之前设置headers
    // 将data数据转成字符串
    config.data = transform(config.data, config.headers, config.transformRequest)
    config.headers = flattenHeaders(config.headers, config.method!)
}
// 处理url
export function transformUrl(config: AxiosRequestConfig): string {
    // 解构出url 和params 属性
    let { url, params, paramsSerializer, baseURL } = config
    // 如果有baseURL 并且url是一个相对地址
    if (baseURL && !isAbsoluteURL(url!)) {
        url = combineURL(baseURL, url)
    }
    // 引入封装的buildURL方法来处理url 在原始方法中，url会变成一个可选参数，所以需要类型断言让url 不会null
    return buildURL(url!, params, paramsSerializer)
}

// 处理responseData
function transformResponseData(res: AxiosResponse): AxiosResponse {
    // 引入处理返回数据类型是字符串类型就解析成对象类型的函数
    res.data = transform(res.data, res.headers, res.config.transformResponse)
    // 返回响应对象
    return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
    // 如果使用过取消操作 就抛出异常
    if (config.cancelToken) {
        console.log(config.cancelToken.throwIfRequested())
    }
}